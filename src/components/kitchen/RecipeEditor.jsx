import { useState, useEffect } from 'react';
import { CATEGORIES, RECIPES } from '../../data/recipes';

// All images in /public/recipes/ (detected by agent)
const IMAGE_ASSETS = [
    "bbq_salmon.jpg", "blueberry_lemon_loaf_cute.jpg", "blueberry_lemon_loaf_real.jpg",
    "blueberry_smoothie.jpg", "boil_same.jpg", "boiling.jpg", "braised.jpg",
    "braised_beef.jpg", "braised_eggplant.png", "braised_same.jpg",
    "chicken_potato_stew.jpg", "congee.jpg", "cranberry_bread.jpg",
    "desserts.jpg", "desserts_same.jpg", "dimsum.jpg", "dimsum_same.jpg",
    "drinks.jpg", "drinks_same.jpg", "eggplant_salad.jpg", "flatbread.jpg",
    "glazed_beef.jpg", "italian_chicken_lemon_egg.jpg", "mala_hotpot.jpg",
    "meat_broth_cute.jpg", "meat_broth_real.jpg", "miso_salmon.jpg",
    "mushroom_tofu.jpg", "oven.jpg", "oven_same.jpg", "paella.jpg",
    "pasta.jpg", "pizza.jpg", "red_bean_soup.jpg", "rice.jpg",
    "salmon.jpg", "scallion_pancake.jpg", "snow_fungus_soup.jpg",
    "soup.jpg", "sparkliing_citrus.jpg", "spicy_poached_chicken.jpg",
    "steamed.jpg", "steamed_egg.jpg", "steamed_same.jpg", "stir_fry.jpg",
    "stir_fry_beef.jpg", "stir_fry_same.jpg", "tomato_beef.jpg", "wonton.jpg"
];

const getNextId = () => {
    if (!RECIPES || RECIPES.length === 0) return 1;
    return Math.max(...RECIPES.map(r => r.id)) + 1;
};

export default function RecipeEditor() {
    const usedImages = RECIPES.map(r => r.image.replace('/recipes/', ''));
    const unusedImages = IMAGE_ASSETS.filter(img => !usedImages.includes(img));

    const [recipe, setRecipe] = useState({
        id: getNextId(),
        categoryId: CATEGORIES[0].id,
        image: '/recipes/',
        name: '',
        description: '',
        difficulty: 'Easy',
        time: '',
        tags: [],
        makes: '',
        ingredients: [{ group: '', items: [''] }],
        steps: [''],
        notes: []
    });

    const [jsonOutput, setJsonOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [imageExists, setImageExists] = useState(false);

    useEffect(() => {
        setJsonOutput(JSON.stringify(recipe, null, 2));
        const imgName = recipe.image.split('/').pop();
        setImageExists(IMAGE_ASSETS.includes(imgName));
    }, [recipe]);

    const handleChange = (field, value) => {
        setRecipe(prev => ({ ...prev, [field]: value }));
    };

    const handleIngredientChange = (groupIndex, itemIndex, value) => {
        const newIngredients = [...recipe.ingredients];
        newIngredients[groupIndex].items[itemIndex] = value;
        setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const addIngredientGroup = () => {
        setRecipe(prev => ({ ...prev, ingredients: [...prev.ingredients, { group: '', items: [''] }] }));
    };

    const removeIngredientGroup = (index) => {
        setRecipe(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
    };

    const addIngredientItem = (groupIndex) => {
        const newIngredients = [...recipe.ingredients];
        newIngredients[groupIndex].items.push('');
        setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const removeIngredientItem = (groupIndex, itemIndex) => {
        const newIngredients = [...recipe.ingredients];
        newIngredients[groupIndex].items = newIngredients[groupIndex].items.filter((_, i) => i !== itemIndex);
        setRecipe(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...recipe.steps];
        newSteps[index] = value;
        setRecipe(prev => ({ ...prev, steps: newSteps }));
    };

    const addStep = () => {
        setRecipe(prev => ({ ...prev, steps: [...prev.steps, ''] }));
    };

    const removeStep = (index) => {
        setRecipe(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
    };

    const handleNoteChange = (index, value) => {
        const newNotes = [...recipe.notes];
        newNotes[index] = value;
        setRecipe(prev => ({ ...prev, notes: newNotes }));
    };

    const addNote = () => {
        setRecipe(prev => ({ ...prev, notes: [...prev.notes, ''] }));
    };

    const removeNote = (index) => {
        setRecipe(prev => ({ ...prev, notes: prev.notes.filter((_, i) => i !== index) }));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fileName = `${recipe.categoryId}-${recipe.name.toLowerCase().replace(/\s+/g, '-')}.json`;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            overflowY: 'auto',
            padding: '4rem 1rem',
            fontFamily: "'DynaPuff', cursive",
            background: '#faf7f2',
            zIndex: 1000,
        }}>
            <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#4a3728', fontSize: '2.5rem', fontFamily: "'Homemade Apple', cursive" }}>🍳 Recipe Creator</h1>
                    </div>
                    <button
                        onClick={() => window.location.href = window.location.origin + window.location.pathname + '?scene=kitchen'}
                        style={secondaryBtnStyle}
                    >
                        Back to Kitchen
                    </button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
                    {/* Form Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        <section style={sectionStyle}>
                            <h2 style={h2Style}>1. Basic Information</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div style={grid2Style}>
                                    <label style={labelStyle}>
                                        Recipe ID
                                        <input type="number" value={recipe.id} onChange={e => handleChange('id', parseInt(e.target.value))} style={inputStyle} />
                                    </label>
                                    <label style={labelStyle}>
                                        Category
                                        <select value={recipe.categoryId} onChange={e => handleChange('categoryId', e.target.value)} style={inputStyle}>
                                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </label>
                                </div>
                                <label style={labelStyle}>
                                    Recipe Name
                                    <input type="text" value={recipe.name} placeholder="e.g. Scallion Pancakes" onChange={e => handleChange('name', e.target.value)} style={inputStyle} />
                                </label>
                                <label style={labelStyle}>
                                    Short Description
                                    <textarea value={recipe.description} placeholder="A brief hook for your recipe..." onChange={e => handleChange('description', e.target.value)} style={{ ...inputStyle, height: '80px' }} />
                                </label>
                                <div style={grid2Style}>
                                    <label style={labelStyle}>Difficulty <select value={recipe.difficulty} onChange={e => handleChange('difficulty', e.target.value)} style={inputStyle}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
                                    <label style={labelStyle}>Time <input type="text" value={recipe.time} placeholder="e.g. 30 min" onChange={e => handleChange('time', e.target.value)} style={inputStyle} /></label>
                                </div>

                                <div style={labelStyle}>
                                    Image Filename
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <input type="text" value={recipe.image} onChange={e => handleChange('image', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                                        <select
                                            onChange={e => handleChange('image', `/recipes/${e.target.value}`)}
                                            style={{ ...inputStyle, width: 'auto' }}
                                            value=""
                                        >
                                            <option value="" disabled>Select image from folder...</option>
                                            {unusedImages.map(img => <option key={img} value={img}>{img}</option>)}
                                        </select>
                                    </div>

                                    {imageExists && (
                                        <div style={{ borderRadius: '24px', overflow: 'hidden', border: '2px solid #e0e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: '#f8f8f8' }}>
                                            <img src={recipe.image} alt="Selected" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                        </div>
                                    )}
                                </div>

                                <div style={grid2Style}>
                                    <label style={labelStyle}>Makes <input type="text" value={recipe.makes} placeholder="e.g. 2 servings" onChange={e => handleChange('makes', e.target.value)} style={inputStyle} /></label>
                                    <label style={labelStyle}>Tags <input type="text" value={recipe.tags.join(', ')} placeholder="Vegan, Fast" onChange={e => handleChange('tags', e.target.value.split(',').map(s => s.trim()))} style={inputStyle} /></label>
                                </div>
                            </div>
                        </section>

                        <section style={sectionStyle}>
                            <h2 style={h2Style}>2. Ingredients</h2>
                            {recipe.ingredients.map((group, gi) => (
                                <div key={gi} style={{ background: '#faf9f7', padding: '1.2rem', borderRadius: '16px', border: '1px solid #eee', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontSize: '0.7rem', color: '#9a8272', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'block' }}>
                                                {recipe.ingredients.length > 1 ? `Group ${gi + 1} Name (Required for multiple groups)` : 'Section Name (Optional)'}
                                            </span>
                                            <input
                                                placeholder={recipe.ingredients.length > 1 ? "e.g. For the Sauce" : "e.g. Main Ingredients (optional)"}
                                                value={group.group}
                                                onChange={e => {
                                                    const newI = [...recipe.ingredients];
                                                    newI[gi].group = e.target.value;
                                                    setRecipe(prev => ({ ...prev, ingredients: newI }));
                                                }}
                                                style={{ ...inputStyle, background: '#fff' }}
                                            />
                                        </div>
                                        {recipe.ingredients.length > 1 && (
                                            <button onClick={() => removeIngredientGroup(gi)} style={{ ...removeBtnStyle, marginTop: '1.2rem' }}>Remove</button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {group.items.map((item, ii) => (
                                            <div key={ii} style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input value={item} placeholder={`Ingredient #${ii + 1}`} onChange={e => handleIngredientChange(gi, ii, e.target.value)} style={{ ...inputStyle, background: '#fff' }} />
                                                <button onClick={() => removeIngredientItem(gi, ii)} style={removeSmallBtnStyle}>×</button>
                                            </div>
                                        ))}
                                        <button onClick={() => addIngredientItem(gi)} style={addBtnStyle}>+ Add Another Item</button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addIngredientGroup} style={primaryBtnStyle}>+ Create Another Section/Group</button>
                        </section>

                        <section style={sectionStyle}>
                            <h2 style={h2Style}>3. Cooking Steps</h2>
                            {recipe.steps.map((step, si) => (
                                <div key={si} style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem' }}>
                                    <div style={{ background: '#7a9878', color: '#fff', width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', marginTop: '0.4rem' }}>{si + 1}</div>
                                    <textarea value={step} placeholder={`Explain step ${si + 1} here...`} onChange={e => handleStepChange(si, e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />
                                    <button onClick={() => removeStep(si)} style={removeSmallBtnStyle}>×</button>
                                </div>
                            ))}
                            <button onClick={addStep} style={primaryBtnStyle}>+ Add Step</button>
                        </section>

                        <section style={sectionStyle}>
                            <h2 style={h2Style}>4. Extra Notes</h2>
                            {recipe.notes.map((note, ni) => (
                                <div key={ni} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input value={note} placeholder={`Extra tip or note #${ni + 1}...`} onChange={e => handleNoteChange(ni, e.target.value)} style={inputStyle} />
                                    <button onClick={() => removeNote(ni)} style={removeSmallBtnStyle}>×</button>
                                </div>
                            ))}
                            <button onClick={addNote} style={primaryBtnStyle}>+ Add Note</button>
                        </section>
                    </div>

                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <section style={{ ...sectionStyle, background: '#f0f4f8', border: '1.5px solid #d0d8e0', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ ...h2Style, color: '#7080a8', border: 'none', margin: 0, padding: 0 }}>JSON Preview</h2>
                                <button onClick={copyToClipboard} style={{ ...primaryBtnStyle, background: '#7080a8' }}>
                                    {copied ? '✓ Copied' : 'Copy JSON'}
                                </button>
                            </div>

                            <div style={{ marginBottom: '1rem', background: '#fff', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e0e8f0' }}>
                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#90a0b0', fontWeight: 'bold' }}>Filename</div>
                                <code style={{ color: '#7080a8', fontSize: '0.9rem', fontWeight: 'bold' }}>{fileName}</code>
                            </div>

                            <pre style={{
                                background: '#fff',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                color: '#4a3728',
                                border: '1.5px solid #e0e8f0',
                                overflowY: 'auto',
                                maxHeight: '42vh',
                                whiteSpace: 'pre-wrap',
                                fontFamily: "'Inter', monospace"
                            }}>
                                {jsonOutput.split('\n').map((line, i) => {
                                    const isKey = line.includes('":');
                                    if (isKey) {
                                        const [key, value] = line.split(/":/);
                                        return <div key={i}><span style={{ color: '#7080a8' }}>{key}"</span>:<span style={{ color: '#b08878' }}>{value}</span></div>;
                                    }
                                    return <div key={i}>{line}</div>;
                                })}
                            </pre>

                            <div style={{ marginTop: '1.5rem', background: '#fff', padding: '1.2rem', borderRadius: '16px', border: '1.5px dashed #7080a8' }}>
                                <h3 style={{ fontSize: '1rem', margin: '0 0 0.8rem', color: '#7080a8' }}>Guide</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                                    <div style={checkItemStyle}><div style={checkCircleStyle}>1</div><span><a href="https://github.com/vivianredpanda/vivianredpanda.github.io/upload/main/public/recipes" target="_blank" style={{ color: '#7080a8', fontWeight: 'bold' }}>Upload image</a> to <code>/public/recipes/</code></span></div>
                                    <div style={checkItemStyle}><div style={checkCircleStyle}>2</div><span>Copy JSON & <a href="https://github.com/vivianredpanda/vivianredpanda.github.io/new/main/src/data/recipes" target="_blank" style={{ color: '#7080a8', fontWeight: 'bold' }}>create file</a></span></div>
                                    <div style={checkItemStyle}><div style={checkCircleStyle}>3</div><span>Use name <code>{fileName}</code></span></div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

const sectionStyle = { background: '#fff', padding: '1.8rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1.5px solid #eee' };
const h2Style = { fontSize: '1.3rem', margin: '0 0 1.2rem 0', color: '#7a6352', fontFamily: "'Yuji Syuku', serif" };
const labelStyle = { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', fontWeight: '700', color: '#7a6352' };
const grid2Style = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    borderRadius: '12px',
    border: '2px solid #f2ede8',
    color: '#4a3728',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: "inherit", // Inherits DynaPuff for that handwritten look
    fontSize: '0.95rem',
    lineHeight: '1.5'
};
const primaryBtnStyle = {
    background: '#7a9878',
    color: '#fff',
    border: 'none',
    padding: '0.7rem 1.2rem',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    fontFamily: 'inherit'
};
const secondaryBtnStyle = {
    background: '#fff',
    color: '#4a3728',
    border: '2px solid #f2ede8',
    padding: '0.6rem 1.2rem',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    fontFamily: 'inherit'
};
const addBtnStyle = {
    background: '#f2ede8',
    color: '#7a6352',
    border: 'none',
    padding: '0.4rem 0.9rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginTop: '0.4rem',
    fontFamily: 'inherit'
};
const removeBtnStyle = {
    background: '#fee',
    color: '#b55',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    fontFamily: 'inherit'
};
const removeSmallBtnStyle = {
    background: '#fee',
    color: '#b55',
    border: 'none',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'inherit'
};
const checkItemStyle = { display: 'flex', alignItems: 'center', gap: '0.6rem' };
const checkCircleStyle = { width: '1.2rem', height: '1.2rem', borderRadius: '50%', border: '1px solid #7080a8', color: '#7080a8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' };
