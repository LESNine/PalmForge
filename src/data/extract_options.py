import json
import re

with open(r'C:\Users\LESNi\Desktop\trea\PalmForge\src\data\palm_params_index.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

results = []
translation_issues = []

for cat in data.get('categories', []):
    cat_id = cat.get('id', '')
    for param in cat.get('parameters', []):
        name = param.get('name', '')
        ptype = param.get('type', '')
        desc = param.get('description', '')
        desc_zh = param.get('description_zh', '')
        default_val = param.get('default_value', '')

        options = []

        if ptype == 'logical':
            options = ['.TRUE.', '.FALSE.']

        if ptype == 'character' and not options:
            # Pattern: "Currently N choices are available:" section
            choices_match = re.search(r'Currently\s+\d+\s+choices?\s+are\s+available\s*:', desc)
            if not choices_match:
                choices_match = re.search(r'\d+\s+choices?\s+are\s+available\s*:', desc)
            if not choices_match:
                choices_match = re.search(r'Currently\s+\d+\s+options?\s+are\s+available\s*:', desc)

            if choices_match:
                after_choices = desc[choices_match.end():]
                # Extract single-quoted strings that look like parameter values
                quoted_vals = re.findall(r"'([^']+)'", after_choices)
                for v in quoted_vals:
                    # Keep short values that look like enum options, skip long descriptions
                    if len(v) <= 50 and v.count(' ') <= 2:
                        if not any(kw in v.lower() for kw in ['parameter', 'scheme', 'method', 'condition', 'boundary', 'option', 'model', 'equation', 'approximation']):
                            if re.match(r'^[a-zA-Z0-9_/\-+.*()]+$', v):
                                options.append(v)

            # Pattern: "Possible values are:" or "Possible values include:"
            if not options:
                possible_match = re.search(r'Possible values\s*(?:are|include)\s*:', desc)
                if possible_match:
                    after = desc[possible_match.end():]
                    quoted_vals = re.findall(r"'([^']+)'", after)
                    for v in quoted_vals:
                        if len(v) <= 60:
                            options.append(v)

            # Pattern: "Can be" followed by quoted values
            if not options:
                can_be_match = re.search(r"Can be\s+'([^']+)'", desc)
                if can_be_match:
                    after = desc[can_be_match.start():]
                    quoted_vals = re.findall(r"'([^']+)'", after)
                    for v in quoted_vals:
                        if len(v) <= 60:
                            options.append(v)

            # Pattern: "Choose from:" followed by quoted values
            if not options:
                choose_match = re.search(r'Choose from\s*:', desc)
                if choose_match:
                    after = desc[choose_match.end():]
                    quoted_vals = re.findall(r"'([^']+)'", after)
                    for v in quoted_vals:
                        if len(v) <= 60:
                            options.append(v)

            # Pattern: "Values:" followed by values
            if not options:
                values_match = re.search(r'Values?\s*:', desc)
                if values_match:
                    after = desc[values_match.end():]
                    quoted_vals = re.findall(r"'([^']+)'", after)
                    for v in quoted_vals:
                        if len(v) <= 60:
                            options.append(v)

            # Deduplicate while preserving order
            seen = set()
            unique_options = []
            for o in options:
                if o not in seen:
                    seen.add(o)
                    unique_options.append(o)
            options = unique_options

        if options:
            results.append({
                'param_name': name,
                'category': cat_id,
                'type': ptype,
                'options': options
            })

        # Translation quality check
        if desc_zh:
            issues = []

            # Check 1: '其' overuse at sentence start
            zh_sentences = re.split(r'[。！？；]', desc_zh)
            qi_count = sum(1 for s in zh_sentences if s.strip().startswith('其'))
            if qi_count >= 3:
                issues.append(f"过多使用'其'开头({qi_count}次)，机器翻译痕迹")

            # Check 2: '栅格' instead of '网格' in CFD context
            if '栅格' in desc_zh and '网格' not in desc_zh:
                issues.append("'栅格'应为'网格'(CFD语境)")

            # Check 3: Significant untranslated English fragments
            english_chunks = re.findall(r'[A-Z][a-z]+(?:\s+[a-z]+){4,}', desc_zh)
            for chunk in english_chunks:
                if not any(term in chunk.lower() for term in ['palm', 'neumann', 'dirichlet', 'courant', 'monin', 'obukhov', 'wicker', 'skamarock', 'boussinesq', 'anelastic', 'sgs', 'tke']):
                    issues.append(f'未翻译的英文片段: "{chunk}"')
                    break

            # Check 4: '该参数' repetitive pattern
            if desc_zh.count('该参数') >= 3:
                issues.append(f"'该参数'重复{desc_zh.count('该参数')}次，表述单调")

            # Check 5: '被' passive voice overuse
            bei_count = desc_zh.count('被')
            if bei_count >= 3:
                issues.append(f"'被'字被动语态过多({bei_count}次)，建议改为主动语态")

            # Check 6: '的' density too high
            de_count = desc_zh.count('的')
            char_count = len(desc_zh)
            if char_count > 50 and de_count / char_count > 0.06:
                issues.append(f"'的'字使用密度过高({de_count}次/{char_count}字={de_count/char_count:.1%})，建议精简")

            # Check 7: Obvious mistranslation patterns
            # "设置" overuse as translation for "setting"
            setting_count = desc_zh.count('设置')
            if setting_count >= 5:
                issues.append(f"'设置'一词重复{setting_count}次，可替换为'设定值'、'配置'等")

            # Check 8: "即" overuse (common in machine translation of "i.e.")
            ji_count = desc_zh.count('，即')
            if ji_count >= 3:
                issues.append(f"'，即'重复{ji_count}次，可适当替换为'也就是'或省略")

            # Check 9: Check for "此参数" + "用于" pattern - very mechanical
            if re.search(r'^此参数用于', desc_zh):
                issues.append("开头'此参数用于'为典型机器翻译句式，建议改为更自然的表述")

            # Check 10: "允许" overuse for "allow/permit"
            allow_count = desc_zh.count('允许')
            if allow_count >= 4:
                issues.append(f"'允许'一词重复{allow_count}次，可替换为'可'、'支持'等")

            if issues:
                translation_issues.append({
                    'param_name': name,
                    'category': cat_id,
                    'issues': issues,
                    'description_zh_snippet': desc_zh[:120] + '...' if len(desc_zh) > 120 else desc_zh
                })

# Write results to JSON
output = {
    'metadata': {
        'source': 'palm_params_index.json',
        'total_params_with_options': len(results),
        'total_translation_issues': len(translation_issues),
        'generated_at': '2026-05-18'
    },
    'param_options': results,
    'translation_issues': translation_issues
}

output_path = r'C:\Users\LESNi\Desktop\trea\PalmForge\src\data\palm_param_options.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f'Total categories: {len(data.get("categories", []))}')
total_params = sum(len(c.get('parameters', [])) for c in data.get('categories', []))
print(f'Total parameters: {total_params}')
print(f'Parameters with options: {len(results)}')
print(f'  - logical type: {sum(1 for r in results if r["type"] == "logical")}')
print(f'  - character type: {sum(1 for r in results if r["type"] == "character")}')
print(f'Translation issues: {len(translation_issues)}')
print()
print('=== All parameters with options ===')
for r in results:
    print(f"  {r['param_name']:40s} ({r['type']:10s}) [{r['category']}]: {r['options']}")
print()
print('=== Translation issues ===')
for t in translation_issues:
    print(f"  {t['param_name']:40s} [{t['category']}]: {t['issues']}")
