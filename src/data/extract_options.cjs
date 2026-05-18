const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:\\Users\\LESNi\\Desktop\\trea\\PalmForge\\src\\data\\palm_params_index.json', 'utf-8'));

const results = [];
const translationIssues = [];

const STOP_WORDS = new Set([
    'the', 'this', 'that', 'these', 'those', 'which', 'where', 'when', 'what',
    'with', 'from', 'into', 'over', 'under', 'after', 'before', 'between',
    'through', 'during', 'without', 'against', 'within', 'along', 'across',
    'behind', 'beyond', 'plus', 'except', 'upon', 'among', 'around', 'since',
    'until', 'below', 'above', 'about', 'both', 'each', 'every', 'other',
    'such', 'than', 'too', 'very', 'also', 'just', 'only', 'even', 'still',
    'already', 'yet', 'never', 'always', 'often', 'however', 'therefore',
    'thus', 'hence', 'moreover', 'furthermore', 'nevertheless', 'meanwhile',
    'otherwise', 'instead', 'rather', 'quite', 'almost', 'nearly', 'simply',
    'merely', 'indeed', 'however', 'further', 'addition',
    'he', 'she', 'it', 'we', 'they', 'who', 'whom', 'whose',
    'on', 'off', 'in', 'out', 'up', 'down', 'to', 'at', 'by', 'for',
    'of', 'or', 'and', 'but', 'if', 'so', 'as', 'an', 'a',
    'may', 'might', 'can', 'could', 'would', 'should', 'shall', 'will',
    'must', 'has', 'have', 'had', 'been', 'being', 'be', 'is', 'are', 'was', 'were',
    'do', 'does', 'did', 'not', 'no', 'nor', 'none',
    'using', 'used', 'requires', 'require', 'allows', 'allow', 'ensures',
    'ensure', 'provides', 'provide', 'gives', 'give', 'takes', 'take',
    'makes', 'make', 'gets', 'get', 'keeps', 'keep', 'leaves', 'leave',
    'causes', 'cause', 'leads', 'lead', 'results', 'result',
    'based', 'given', 'set', 'see', 'note', 'example',
    'profiles', 'profile', 'surface', 'surfaces', 'model',
    'point', 'points', 'value', 'values', 'field', 'fields',
    'data', 'domain', 'level', 'levels', 'layer',
    'height', 'width', 'length', 'size', 'time', 'step', 'steps',
    'case', 'method', 'scheme', 'parameter', 'variable',
    'condition', 'boundary', 'output', 'input', 'result', 'error',
    'option', 'setting', 'default', 'required', 'available',
    'number', 'rate', 'factor', 'term', 'component',
    'part', 'section', 'region', 'area', 'volume', 'mass',
    'density', 'pressure', 'temperature', 'velocity', 'speed',
    'direction', 'distance', 'range', 'limit',
    'maximum', 'minimum', 'average', 'mean', 'total',
    'difference', 'change', 'distribution', 'function',
    'equation', 'ratio', 'index', 'test', 'check',
    'control', 'flag', 'mode', 'type', 'kind', 'form', 'format',
    'class', 'category', 'group', 'feature', 'property',
    'effect', 'impact', 'influence', 'role', 'purpose',
    'application', 'approach', 'technique', 'procedure',
    'process', 'operation', 'action', 'phase', 'stage', 'state', 'status',
    'order', 'degree', 'version', 'source', 'target',
    'problem', 'issue', 'question', 'answer', 'solution',
    'structure', 'system', 'network', 'framework',
    'observation', 'measurement', 'experiment', 'simulation',
    'analysis', 'assessment', 'evaluation', 'comparison',
    'study', 'research', 'development', 'design',
    'validation', 'verification', 'calibration',
    'convergence', 'stability', 'efficiency', 'performance',
    'initial', 'final', 'previous', 'current',
    'horizontal', 'vertical', 'normal', 'parallel',
    'physical', 'numerical', 'analytical', 'empirical',
    'exact', 'approximate', 'accurate', 'precise',
    'explicit', 'implicit', 'direct', 'indirect',
    'continuous', 'discrete', 'steady', 'unsteady',
    'laminar', 'turbulent', 'resolved', 'subgrid',
    'prognostic', 'diagnostic', 'prescribed', 'computed',
    'upstream', 'downstream', 'inflow', 'outflow',
    'rigid', 'compressible', 'incompressible',
    'conservative', 'monotone',
    'internal', 'external', 'inner', 'outer', 'upper', 'lower',
    'left', 'right', 'top', 'bottom', 'middle',
    'local', 'global', 'spatial', 'temporal',
    'new', 'old', 'first', 'second', 'third', 'last', 'next',
    'simple', 'complex', 'basic', 'advanced', 'standard', 'special',
    'general', 'specific', 'single', 'multiple',
    'relative', 'absolute', 'constant', 'variable',
    'positive', 'negative', 'active', 'passive',
    'independent', 'dependent', 'separate', 'combined',
    'open', 'closed', 'fixed', 'free',
    'static', 'dynamic', 'stable', 'unstable',
    'forward', 'backward', 'upward', 'downward',
    'adjacent', 'opposite', 'nearby', 'distant',
    'same', 'different', 'similar', 'corresponding',
    'entire', 'whole', 'partial', 'complete',
    'necessary', 'sufficient', 'mandatory', 'optional',
    'recommended', 'deprecated',
    'following', 'including', 'excluding', 'regarding',
    'assuming', 'supposing', 'provided', 'granted',
    'depending', 'according', 'respectively',
    'therefore', 'consequently', 'subsequently',
    'here', 'there', 'whereas', 'wherever', 'whether',
    'because', 'although', 'though', 'unless',
    'while', 'during', 'before', 'after',
    'much', 'many', 'few', 'several', 'various',
    'all', 'any', 'some', 'most', 'more', 'less',
    'only', 'even', 'still', 'already', 'yet',
    'just', 'quite', 'rather', 'almost', 'nearly',
    'especially', 'particularly', 'specifically', 'notably',
    'indeed', 'actually', 'basically', 'essentially',
    'generally', 'typically', 'usually', 'normally',
    'primarily', 'mainly', 'largely', 'mostly',
    'simply', 'merely', 'barely', 'scarcely', 'hardly',
    'instead', 'otherwise', 'nevertheless', 'nonetheless',
    'furthermore', 'moreover', 'besides', 'additionally',
    'therefore', 'thus', 'hence', 'consequently',
    'accordingly', 'subsequently', 'eventually',
    'previously', 'formerly', 'originally', 'initially',
    'finally', 'ultimately', 'eventually',
    'perhaps', 'maybe', 'possibly', 'probably', 'certainly',
    'definitely', 'obviously', 'clearly', 'apparently',
    'evidently', 'undoubtedly', 'unquestionably',
    'surprisingly', 'unexpectedly', 'interestingly',
    'importantly', 'significantly', 'remarkably',
    'unfortunately', 'fortunately', 'interestingly',
    'naturally', 'normally', 'typically', 'commonly',
    'frequently', 'rarely', 'seldom', 'occasionally',
    'regularly', 'consistently', 'continuously',
    'periodically', 'intermittently', 'sporadically',
    'gradually', 'steadily', 'rapidly', 'slowly',
    'increasingly', 'decreasingly', 'progressively',
    'proportionally', 'inversely', 'directly',
    'approximately', 'roughly', 'exactly', 'precisely',
    'strictly', 'loosely', 'broadly', 'narrowly',
    'relatively', 'comparatively', 'respectively',
    'independently', 'dependently', 'mutually',
    'simultaneously', 'concurrently', 'sequentially',
    'alternatively', 'conversely', 'inversely',
    'respectively', 'respectively',
    'otherwise', 'instead', 'rather',
    'thereby', 'thereof', 'therein', 'thereafter',
    'herein', 'hereafter', 'whereby', 'whereof',
    'whenever', 'wherever', 'however',
]);

function extractOptionsFromDesc(desc, ptype, defaultVal) {
    let options = [];

    if (ptype === 'logical') {
        return ['.TRUE.', '.FALSE.'];
    }

    if (ptype !== 'character') {
        return options;
    }

    let choicesMatch = desc.match(/Currently\s+(\d+)\s+choices?\s+are\s+available\s*:/);
    if (!choicesMatch) {
        choicesMatch = desc.match(/(\d+)\s+choices?\s+are\s+available\s*:/);
    }
    if (!choicesMatch) {
        choicesMatch = desc.match(/Currently\s+(\d+)\s+options?\s+are\s+available\s*:/);
    }

    let expectedCount = 0;
    if (choicesMatch) {
        expectedCount = parseInt(choicesMatch[1], 10);
    }

    if (choicesMatch) {
        const afterChoices = desc.slice(choicesMatch.index + choicesMatch[0].length).trim();

        // Strategy A: Strict pattern - option after ". ", ") ", or at start, followed by capital/digit
        const strictPattern = /(?:^|\.\s+|\)\s+)([a-z][a-zA-Z0-9_\/\-\+]*)\s+(?:[A-Z]|\d)/g;
        let m;
        const strictMatches = [];
        while ((m = strictPattern.exec(afterChoices)) !== null) {
            const opt = m[1];
            if (!STOP_WORDS.has(opt.toLowerCase()) && opt.length >= 1 && opt.length <= 40) {
                strictMatches.push(opt);
            }
        }

        // Deduplicate strict matches
        const seenStrict = new Set();
        const uniqueStrict = [];
        for (const o of strictMatches) {
            if (!seenStrict.has(o)) {
                seenStrict.add(o);
                uniqueStrict.push(o);
            }
        }

        options = uniqueStrict;

        // Strategy B: Add default value if not already present
        if (defaultVal && defaultVal !== 'undefined' && defaultVal !== '' && !options.includes(defaultVal)) {
            options.unshift(defaultVal);
        }

        // Strategy C: If we still don't have enough, look for compound words (with _/-)
        // that appear in the "choices" section and are followed by a capital letter
        if (options.length < expectedCount) {
            const compoundPattern = /(?:^|\.\s+|\)\s+)([a-z][a-zA-Z0-9]*[_\-][a-zA-Z0-9_\-]*)\s+(?:[A-Z]|\d)/g;
            let cm;
            while ((cm = compoundPattern.exec(afterChoices)) !== null) {
                const opt = cm[1];
                if (!options.includes(opt) && opt.length >= 3 && opt.length <= 40) {
                    options.push(opt);
                }
            }
        }

        // Strategy D: Quoted values as fallback
        if (options.length === 0) {
            const quotedVals = afterChoices.match(/'([^']+)'/g) || [];
            for (const v of quotedVals) {
                const cleaned = v.replace(/^'|'$/g, '');
                if (cleaned.length <= 50 && (cleaned.match(/ /g) || []).length <= 2) {
                    if (/^[a-zA-Z0-9_\/\-\+\.\*\(\)]+$/.test(cleaned)) {
                        options.push(cleaned);
                    }
                }
            }
        }

        // Strategy E: Special chars like (u*)**2+neumann
        if (options.length < expectedCount) {
            const specialPattern = /(?:^|\.\s+|\)\s+)(\([^)]+\)[a-zA-Z0-9\*\+\-]*)\s+(?:[A-Z]|\d)/g;
            let sm;
            while ((sm = specialPattern.exec(afterChoices)) !== null) {
                if (!options.includes(sm[1])) {
                    options.push(sm[1]);
                }
            }
        }
    }

    // Strategy 2: "Possible values are:" or "Possible values include:"
    if (options.length === 0) {
        const possibleMatch = desc.match(/Possible values\s*(?:are|include)\s*:/);
        if (possibleMatch) {
            const after = desc.slice(possibleMatch.index + possibleMatch[0].length);
            const quotedVals = after.match(/'([^']+)'/g) || [];
            for (const v of quotedVals) {
                const cleaned = v.replace(/^'|'$/g, '');
                if (cleaned.length <= 60) {
                    options.push(cleaned);
                }
            }
        }
    }

    // Strategy 3: "Can be" followed by quoted values
    if (options.length === 0) {
        const canBeMatch = desc.match(/Can be\s+'([^']+)'/);
        if (canBeMatch) {
            const after = desc.slice(desc.indexOf(canBeMatch[0]));
            const quotedVals = after.match(/'([^']+)'/g) || [];
            for (const v of quotedVals) {
                const cleaned = v.replace(/^'|'$/g, '');
                if (cleaned.length <= 60) {
                    options.push(cleaned);
                }
            }
        }
    }

    // Strategy 4: "Choose from:" followed by quoted values
    if (options.length === 0) {
        const chooseMatch = desc.match(/Choose from\s*:/);
        if (chooseMatch) {
            const after = desc.slice(chooseMatch.index + chooseMatch[0].length);
            const quotedVals = after.match(/'([^']+)'/g) || [];
            for (const v of quotedVals) {
                const cleaned = v.replace(/^'|'$/g, '');
                if (cleaned.length <= 60) {
                    options.push(cleaned);
                }
            }
        }
    }

    // Strategy 5: "Values:" followed by values
    if (options.length === 0) {
        const valuesMatch = desc.match(/Values?\s*:/);
        if (valuesMatch) {
            const after = desc.slice(valuesMatch.index + valuesMatch[0].length);
            const quotedVals = after.match(/'([^']+)'/g) || [];
            for (const v of quotedVals) {
                const cleaned = v.replace(/^'|'$/g, '');
                if (cleaned.length <= 60) {
                    options.push(cleaned);
                }
            }
        }
    }

    // Filter out non-option values
    options = options.filter(o => {
        if (o.startsWith('Depends on')) return false;
        if (o.startsWith('Value of')) return false;
        if (o.startsWith('[')) return false;
        if (o.includes(' ') && !o.includes('/')) return false;
        return true;
    });

    // Deduplicate while preserving order
    const seen = new Set();
    const uniqueOptions = [];
    for (const o of options) {
        if (!seen.has(o)) {
            seen.add(o);
            uniqueOptions.push(o);
        }
    }
    return uniqueOptions;
}

for (const cat of (data.categories || [])) {
    const catId = cat.id || '';
    for (const param of (cat.parameters || [])) {
        const name = param.name || '';
        const ptype = param.type || '';
        const desc = param.description || '';
        const descZh = param.description_zh || '';
        const defaultVal = param.default_value || '';

        const options = extractOptionsFromDesc(desc, ptype, defaultVal);

        if (options.length > 0) {
            results.push({
                param_name: name,
                category: catId,
                type: ptype,
                options: options
            });
        }

        if (descZh) {
            const issues = [];

            const zhSentences = descZh.split(/[。！？；]/);
            const qiCount = zhSentences.filter(s => s.trim().startsWith('其')).length;
            if (qiCount >= 3) {
                issues.push(`过多使用'其'开头(${qiCount}次)，机器翻译痕迹`);
            }

            if (descZh.includes('栅格') && !descZh.includes('网格')) {
                issues.push("'栅格'应为'网格'(CFD语境)");
            }

            const englishChunks = descZh.match(/[A-Z][a-z]+(?:\s+[a-z]+){4,}/g) || [];
            for (const chunk of englishChunks) {
                const lowerChunk = chunk.toLowerCase();
                if (!['palm', 'neumann', 'dirichlet', 'courant', 'monin', 'obukhov', 'wicker', 'skamarock', 'boussinesq', 'anelastic', 'sgs', 'tke'].some(term => lowerChunk.includes(term))) {
                    issues.push(`未翻译的英文片段: "${chunk}"`);
                    break;
                }
            }

            const gaiParamCount = (descZh.match(/该参数/g) || []).length;
            if (gaiParamCount >= 3) {
                issues.push(`'该参数'重复${gaiParamCount}次，表述单调`);
            }

            const beiCount = (descZh.match(/被/g) || []).length;
            if (beiCount >= 3) {
                issues.push(`'被'字被动语态过多(${beiCount}次)，建议改为主动语态`);
            }

            const deCount = (descZh.match(/的/g) || []).length;
            const charCount = descZh.length;
            if (charCount > 50 && deCount / charCount > 0.06) {
                issues.push(`'的'字使用密度过高(${deCount}次/${charCount}字=${(deCount/charCount*100).toFixed(1)}%)，建议精简`);
            }

            const settingCount = (descZh.match(/设置/g) || []).length;
            if (settingCount >= 5) {
                issues.push(`'设置'一词重复${settingCount}次，可替换为'设定值'、'配置'等`);
            }

            const jiCount = (descZh.match(/，即/g) || []).length;
            if (jiCount >= 3) {
                issues.push(`'，即'重复${jiCount}次，可适当替换为'也就是'或省略`);
            }

            if (/^此参数用于/.test(descZh)) {
                issues.push("开头'此参数用于'为典型机器翻译句式，建议改为更自然的表述");
            }

            const allowCount = (descZh.match(/允许/g) || []).length;
            if (allowCount >= 4) {
                issues.push(`'允许'一词重复${allowCount}次，可替换为'可'、'支持'等`);
            }

            const jinxingCount = (descZh.match(/进行/g) || []).length;
            if (jinxingCount >= 4) {
                issues.push(`'进行'一词重复${jinxingCount}次，典型机器翻译痕迹，建议精简`);
            }

            if (issues.length > 0) {
                translationIssues.push({
                    param_name: name,
                    category: catId,
                    issues: issues,
                    description_zh_snippet: descZh.length > 120 ? descZh.slice(0, 120) + '...' : descZh
                });
            }
        }
    }
}

const output = {
    metadata: {
        source: 'palm_params_index.json',
        total_params_with_options: results.length,
        total_translation_issues: translationIssues.length,
        generated_at: '2026-05-18'
    },
    param_options: results,
    translation_issues: translationIssues
};

const outputPath = 'C:\\Users\\LESNi\\Desktop\\trea\\PalmForge\\src\\data\\palm_param_options.json';
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`Total categories: ${(data.categories || []).length}`);
const totalParams = (data.categories || []).reduce((sum, c) => sum + (c.parameters || []).length, 0);
console.log(`Total parameters: ${totalParams}`);
console.log(`Parameters with options: ${results.length}`);
console.log(`  - logical type: ${results.filter(r => r.type === 'logical').length}`);
console.log(`  - character type: ${results.filter(r => r.type === 'character').length}`);
console.log(`Translation issues: ${translationIssues.length}`);
console.log();
console.log('=== Character type parameters with options ===');
for (const r of results.filter(r => r.type === 'character')) {
    console.log(`  ${r.param_name.padEnd(40)} [${r.category}]: ${JSON.stringify(r.options)}`);
}
console.log();
console.log('=== Translation issues ===');
for (const t of translationIssues) {
    console.log(`  ${t.param_name.padEnd(40)} [${t.category}]: ${JSON.stringify(t.issues)}`);
}
