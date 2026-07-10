import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app", "plant_disease.db")

DISEASES_DATA = [
    # APPLE
    ("Apple", "Apple Scab", 
     "A severe fungal disease caused by Venturia inaequalis affecting apple leaves, buds, and fruits, resulting in scabby lesions.",
     "Concentric green/black spots with velvet texture on leaves, progressing to dark scabby spots on fruit making them unmarketable.",
     "Venturia inaequalis fungus overwintering on fallen leaves. Spores spread by early spring rains and wind splashing.",
     "Prune dense branches to maximize aeration. Rake and compost/burn fallen leaves in winter to destroy fungal spores. Spray organic sulfur or copper sprays preventatively during early bud break.",
     "Apply chemical protectant fungicides like captan, mancozeb, or sterol-inhibitors (myclobutanil) at tight cluster stage and weekly intervals.",
     "Mulch soil bed under apple trees, prioritize early spring sanitation, and plant scab-resistant cultivars like Honeycrisp or Liberty."),
     
    ("Apple", "Black Rot",
     "A rot disease caused by Botryosphaeria obtusa affecting leaves (frog-eye spots), limbs (cankers), and fruit.",
     "Frog-eye circular lesions on leaves. Fruit develops concentric brown rings of rot that eventually mummify the crop on branches.",
     "Botryosphaeria obtusa fungus, entering leaves and branches through wounds or pruning cuts during damp conditions.",
     "Prune out dead branches and infected cankers during winter. Destroy mummified fruit on tree and floor. Apply liquid lime-sulfur spray during early spring.",
     "Apply fungicides containing captan, fludioxonil, or thiophanate-methyl during flowering and shoot growth stages.",
     "Sanitize pruning shears with alcohol, avoid tree trunk damage, and keep trees fertilized to maximize trunk health."),

    ("Apple", "Healthy",
     "Optimal health profile for Apple foliage and branches.",
     "Leaves are deep green, symmetrical, and free of blemishes. Bark is clean, buds are robust, and fruit development is uniform.",
     "Proper soil nutrition, timely pruning, balanced watering, and good sunlight access.",
     "Maintain compost applications, check soil pH (prefers 6.0 - 6.8), and water base weekly during dry spells.",
     "No chemical applications required. Maintain standard organic fertilizer routines.",
     "Examine foliage weekly, verify irrigation drainage, and paint trunk base with white paint to prevent insect boring."),

    # CORN
    ("Corn (Maize)", "Common Rust",
     "A common foliar rust disease caused by Puccinia sorghi, causing reddish-brown pustules on both leaf surfaces.",
     "Elongated golden-brown to red powdery pustules (uredinia) on leaves, turning black as plant matures. Severe cases cause leaf death.",
     "Puccinia sorghi fungus. Spores are blown by wind from warm southern climates to northern growing fields in early summer.",
     "Plant rust-resistant hybrids. Remove crop residues after harvest. Spray natural copper fungicide if spots appear early in home gardens.",
     "Apply systemic foliar fungicides like pyraclostrobin, azoxystrobin, or propiconazole at first sign of pustules.",
     "Rotate corn with legumes, manage crop density to reduce leaf canopy humidity, and plant early in the season."),

    ("Corn (Maize)", "Northern Leaf Blight",
     "A damaging fungal disease causing long, cigar-shaped necrotic lesions on corn foliage.",
     "Large, elliptical gray-green or tan spots (cigar-shaped) appearing first on lower leaves, merging to dry out entire leaves.",
     "Exserohilum turcicum fungus. Survives winter in crop residue and spreads by wind and splashing water to lower foliage.",
     "Deep till soil in autumn to bury crop residues. Select resistant seed hybrids. Apply compost teas to foliage to boost leaf microbes.",
     "Apply protective fungicides containing strobilurins or triazoles during vegetative stages (V4 to silking) if symptoms escalate.",
     "Rotate corn out of field for 2+ years, adjust spacing to 30 inches between rows, and inspect lower leaves regularly."),

    ("Corn (Maize)", "Healthy",
     "Excellent health profile for Zea mays crops.",
     "Dark green leaves, stout stalks, thick roots, and uniform ear formation. Silks are strong and free from mold.",
     "Good soil organic carbon, balanced NPK application, and proper warm temperature climate.",
     "Maintain high-quality compost top-dressing and keep weeds down to prevent nutrient drainage.",
     "None required. Maintain balanced nitrogen watering.",
     "Keep spacing wide, rotate with nitrogen-fixing soybeans, and monitor moisture during pollination."),

    # GRAPE
    ("Grape", "Black Rot",
     "A highly destructive fungal disease caused by Guignardia bidwellii affecting all green parts of grape vines.",
     "Small brown circular spots on leaves with tiny black dots. Berries turn soft and rot, then shrivel into hard, black mummies.",
     "Guignardia bidwellii fungus. Overwinters in black mummified berries on the soil or trellises, activated by wet spring weather.",
     "Manually pick off and destroy all mummified fruit. Prune lower canopy to keep vines 18 inches off the ground. Spray sulfur preventatively.",
     "Spray mancozeb, myclobutanil, or strobilurin-based chemical fungicides beginning at bud break until bloom ends.",
     "Sanitize trellises, keep rows clear of weed foliage, prune during winter dormancy, and keep leaves ventilated."),

    ("Grape", "Powdery Mildew",
     "A major fungal disease covering grape tissue with white, powdery ash-like spores.",
     "White or gray powdery dust patches on leaves and shoots. Berries split open, fail to sweeten, and develop gray scars.",
     "Erysiphe necator fungus, thriving in warm, dry weather with high relative humidity.",
     "Expose vines to direct sunlight by selective pruning. Spray neem oil, horticultural oils, or potassium bicarbonate solutions.",
     "Apply sulfur dust, quinoxyfen, or myclobutanil during early shoot extension and pre-bloom cycles.",
     "Avoid shade trellis zones, irrigate at base, prune leaf canopy for airflow, and plant resistant cultivars."),

    ("Grape", "Healthy",
     "Vigorous health profile for Vitis vinifera vines.",
     "Leaves are broad, green, and flat. Shoots are firm, fruit clusters are packed and swell uniformly without cracking.",
     "Sandy loam drainage, balanced micronutrients (iron, magnesium), and intensive direct sunlight exposure.",
     "Apply mulch around base root zones, fertilize with composted manure in early spring, and water deeply.",
     "No chemicals required.",
     "Maintain tight trellis supports, prune aggressively in late winter, and check leaves for chewing beetles."),

    # POTATO
    ("Potato", "Early Blight",
     "A common fungal leaf spot disease caused by Alternaria solani, reducing tuber yield.",
     "Dark brown, circular target-like spots with concentric rings on older leaves first. Foliage yellows and dies.",
     "Alternaria solani fungus, surviving in soil debris. Activated by warm temperatures and alternating wet-dry foliage cycles.",
     "Apply crop rotation (avoid planting tomato/potato nearby). Spray neem oil or organic copper-based solutions preventatively.",
     "Apply foliar protective fungicides containing chlorothalonil, mancozeb, or azoxystrobin at early row closure.",
     "Use certified disease-free tubers, maintain soil potassium levels, and irrigate early in morning at base."),
     
    ("Potato", "Late Blight",
     "A highly destructive disease caused by Phytophthora infestans that triggered the Irish Potato Famine.",
     "Large water-soaked dark spots on leaves with fuzzy white mold on the leaf undersides during wet weather. Tubers rot quickly.",
     "Phytophthora infestans water mold. Spreads rapidly in cool, wet weather via wind-blown sporangia.",
     "Destroy all volunteer potato plants. Remove infected foliage instantly. Apply organic copper sprays weekly during damp weeks.",
     "Apply systemic chemical fungicides like metalaxyl-M, chlorothalonil, or famoxadone immediately upon warning forecasts.",
     "Never leave cull piles near fields, plant resistant cultivars, and ensure potato tubers are well hilled with soil."),
     
    ("Potato", "Healthy",
     "Optimal health profile for Solanum tuberosum.",
     "Foliage is dense, clean, and green. Roots show healthy tuber development, and tubers are firm with uniform skin.",
     "Loose, sandy loam acidic soil (pH 5.0 - 5.5), regular water, and high potassium compost.",
     "Keep base soil loose and aerated. Mound soil around base stems (hilling) to protect potato tubers from greening.",
     "None required.",
     "Rotate potato with legumes, check leaf undersides for potato beetles, and harvest after foliage dies down naturally."),

    # TOMATO
    ("Tomato", "Early Blight",
     "A soil-borne fungal leaf spot disease causing defoliation and spotty fruit.",
     "Concentric target-like dark spots on lower leaves. Lower leaves yellow and drop, exposing tomato fruits to sunscald.",
     "Alternaria solani fungus. Splashes from soil debris onto lower leaves during irrigation.",
     "Mulch soil heavily to block soil splashes. Prune off lower 12 inches of leaves as vine grows. Spray organic copper.",
     "Apply chemical fungicides containing chlorothalonil or copper octanoate at early flower budding.",
     "Space plants 24 inches apart, rotate tomato beds annually, and water roots using drip lines."),

    ("Tomato", "Late Blight",
     "A rapid fungal-like blight destroying leaves and rotting tomatoes within days.",
     "Large water-soaked leaf blotches turning black. White mold on undersides. Fruits turn brown, dry, and leathery.",
     "Phytophthora infestans oomycete, spreading through wind-borne spores in humid, rainy weather.",
     "Remove and destroy whole infected vines. Avoid splashing foliage. Spray preventative copper fungicides.",
     "Apply systemic fungicides like chlorothalonil, cymoxanil, or mefenoxam at first report of local outbreak.",
     "Plant resistant hybrids (e.g., Defiant), remove wild nightshade weeds, and avoid overhead sprinkler systems."),

    ("Tomato", "Leaf Mold",
     "A greenhouse-associated fungal disease caused by Passalora fulva under high humidity.",
     "Pale green or yellow spots on upper surfaces of leaves, turning into olive-green velvet mold patches underneath.",
     "Passalora fulva fungus, proliferating in warm (65-80F) air with relative humidity exceeding 85%.",
     "Maximize greenhouse ventilation. Space plants widely. Spray organic biofungicides containing Bacillus subtilis.",
     "Apply fungicides containing mancozeb or chlorothalonil at early canopy closure.",
     "Keep relative humidity below 75% in greenhouses, use drip lines, and prune internal branches to let air flow."),

    ("Tomato", "Yellow Leaf Curl",
     "A severe viral disease causing dwarfed, curled leaves and flower drop, preventing fruit set.",
     "Leaf edges curl upward and cup like bowls. Leaves show yellowing (chlorosis) between veins. Plant growth stops.",
     "Tomato Yellow Leaf Curl Virus (TYLCV), transmitted exclusively by silverleaf whiteflies (Bemisia tabaci).",
     "Install fine mesh screens in greenhouses. Hang yellow sticky traps to catch whiteflies. Spray insecticidal soap or neem oil.",
     "Apply systemic insecticides targeting whiteflies, such as imidacloprid, acetamiprid, or bifenthrin.",
     "Uproot and burn virus-infected plants immediately. Control weeds like nightshade that harbor whiteflies."),

    ("Tomato", "Healthy",
     "Optimal health profile for Solanum lycopersicum.",
     "Vibrant green leaves, strong central vine, plentiful yellow flowers, and firm, bright red tomatoes without blossom-end cracks.",
     "Loose rich soil, balanced pH (6.2 - 6.8), consistent base watering, and full daily sunlight.",
     "Feed monthly with organic tomato food (rich in calcium). Keep vine staked securely.",
     "None required.",
     "Maintain thick straw mulch, prune side suckers weekly, and inspect leaf undersides for hornworm caterpillars."),

    # STRAWBERRY
    ("Strawberry", "Leaf Scorch",
     "A leaf spot disease causing purple-red spots that dry out strawberry crowns.",
     "Numerous dark purple spots on leaves, merging to turn entire foliage dry, brown, and scorched. Fruit quality declines.",
     "Diplocarpon earlianum fungus. Spreads via water splashes and overwintering leaves.",
     "Remove old leaves during spring cleanup. Space plants 12 inches apart. Apply organic copper sprays in early spring.",
     "Apply captan, thiram, or thiophanate-methyl chemical fungicides during early leaf expansion.",
     "Avoid excessive nitrogen fertilizers in spring (invites fungus), rotate strawberry beds, and irrigate using drip tubes."),

    ("Strawberry", "Healthy",
     "Vigorous health profile for Fragaria ananassa.",
     "Leaves are dark green and glossy. Runners are strong, crowns are thick, and red berries are firm and sweet.",
     "Well-drained sandy loam soil rich in compost. High organic matter.",
     "Top-dress with pine needles or straw mulch to keep berries clean. Water 1 inch weekly.",
     "None required.",
     "Harvest berries daily to prevent gray mold, prune runners to redirect plant energy, and check crowns for grubs."),

    # PEACH
    ("Peach", "Bacterial Spot",
     "A damaging bacterial disease caused by Xanthomonas campestris causing shot-holes on peach foliage.",
     "Leaves develop small dark spots that eventually drop out, leaving shot-holes. Fruit develops dark lesions and cracks.",
     "Xanthomonas campestris pv. pruni bacteria. Enters through stomata during spring rainfall.",
     "Plant resistant cultivars. Apply copper sprays during late dormancy and early leaf fall.",
     "Apply bactericidal chemical sprays like oxytetracycline (Mycoshield) or copper mixtures weekly during wet springs.",
     "Avoid high nitrogen applications, fertilize trees to maintain shoot vigor, and prune for light canopy penetration."),

    ("Peach", "Healthy",
     "Optimal health profile for Prunus persica orchards.",
     "Leaves are long, green, and smooth. Branches show strong shoot growth, and peaches are fuzzy, plump, and clean.",
     "Deep, sandy loam soil with excellent root drainage. pH 6.0 - 6.5. Full sunlight.",
     "Add organic compost to root boundaries, prune tree center (open center method) to allow sunlight to lower limbs.",
     "None required.",
     "Thin young peach fruits in early summer to maximize fruit sizing, and monitor tree base for peach tree borers."),

    # PEPPER BELL
    ("Pepper, Bell", "Bacterial Spot",
     "A severe bacterial leaf spot disease causing defoliation and scabby lesions on bell peppers.",
     "Small water-soaked green spots on leaves, turning dark brown with yellow halos. Leaves drop, leading to fruit sunscald.",
     "Xanthomonas campestris pv. vesicatoria bacteria. Survives in seed coats and infected plant debris.",
     "Use certified disease-free seeds. Spray organic copper hydroxide or copper octanoate preventatively.",
     "Apply copper-mancozeb tank mixtures weekly during warm, humid rainfall cycles.",
     "Stake pepper plants, rotate with non-solanaceous crops, avoid working in gardens when leaves are wet, and sanitize tools."),

    ("Pepper, Bell", "Healthy",
     "Vibrant health profile for Capsicum annuum plants.",
     "Leaves are smooth and rich green. Stems are sturdy, bearing clean, glossy, multi-lobed green/red bell peppers.",
     "Warm loamy soil rich in calcium and magnesium. Stable root hydration. pH 6.2 - 6.8.",
     "Mulch with grass clippings, apply compost tea monthly, and support branches with pepper cages.",
     "None required.",
     "Watch for blossom-end rot by watering consistently, and hand-pick any leaf-chewing hornworms."),

    # ORANGE
    ("Orange", "Citrus Greening",
     "A deadly bacterial disease causing yellowing foliage and bitter, deformed green citrus fruit.",
     "Leaves show blotchy, asymmetrical yellow mottling. Branches die back. Oranges remain small, lopsided, green, and bitter.",
     "Candidatus Liberibacter asiaticus bacteria. Transmitted by the Asian Citrus Psyllid (Diaphorina citri).",
     "Prune and destroy infected citrus limbs. Spray hort oils to deter psyllids. Hang sticky traps in orchards.",
     "Apply systemic insecticides containing imidacloprid or thiamethoxam to control psyllids in commercial groves.",
     "Use certified disease-free nursery stock, fertilize citrus trees aggressively, and monitor leaves for psyllids."),

    ("Orange", "Healthy",
     "Excellent health profile for Citrus sinensis groves.",
     "Dense, deep green leaves. White fragrant blossoms, and heavy yields of round, bright orange, sweet citrus fruits.",
     "Well-drained sandy loam soil, warm climate, and high citrus-specific fertilization (nitrogen, zinc, iron).",
     "Apply high-nitrogen citrus compost, keep base trunk clear of grass, and water deeply once a week.",
     "None required.",
     "Prune water shoots, monitor soil drainage, and spray base with white latex paint to repel insect entry."),

    # SQUASH
    ("Squash", "Powdery Mildew",
     "A very common foliar fungal disease covering squash leaves with white dust, causing early leaf death.",
     "Talcom-powder-like white spots spread across upper leaf surfaces. Leaves eventually brown, curl, and turn crisp.",
     "Podosphaera xanthii fungus, spreading during dry, warm conditions with high relative humidity.",
     "Spray leaves preventatively with a milk-water mixture (1:9 ratio) or baking soda solution. Space plants 3 feet apart.",
     "Apply fungicides containing potassium bicarbonate, myclobutanil, or azoxystrobin at early runners.",
     "Water soil base using drip hoses, plant squash in full direct sun, and remove old vines at the end of harvest."),

    ("Squash", "Healthy",
     "Optimal health profile for Cucurbita pepo vines.",
     "Broad, clean, green leaves. Heavy yellow blossoms, and abundant, firm squashes/zucchinis without soft rot spots.",
     "Rich organic soil, deep hydration, and heavy composting. pH 6.0 - 6.8. Honeybee pollination access.",
     "Apply thick organic compost around root zone, mulch heavily, and grow flowers nearby to attract pollinating bees.",
     "None required.",
     "Keep squash fruits raised off wet ground using straw mulch, and check leaves for squash bugs and vine borers."),

    # BLUEBERRY
    ("Blueberry", "Healthy",
     "Thriving health profile for Vaccinium corymbosum bushes.",
     "Leaves are small, green, and firm. Stems are woody, bearing abundant clusters of round, dusky blue, sweet berries.",
     "Highly acidic soil (pH 4.5 - 5.2), peat moss base, and pine needle mulch.",
     "Aerate soil with peat moss, apply pine needle mulch to acidify root zones, and water with rainwater (not tap water).",
     "None required.",
     "Prune older canes in late winter to encourage new shoots, and protect bushes from birds with netting."),

    # CHERRY
    ("Cherry (Including Sour)", "Healthy",
     "Optimal health profile for Prunus cerasus orchards.",
     "Leaves are smooth, green, and flat. Stems are robust, bearing glossy, bright red cherries with clean green stems.",
     "Well-drained loamy soil, good airflow, and cool spring temperatures. pH 6.0 - 6.5.",
     "Add organic compost to drip boundaries, prune branches to let sun reach the inner trunk, and mulch base.",
     "None required.",
     "Harvest cherry clusters carefully to avoid tearing branch buds, and check trunks for peach tree borers."),

    # PEACH
    ("Peach", "Healthy",
     "Optimal health profile for Prunus persica orchards.",
     "Leaves are long, green, and smooth. Branches show strong shoot growth, and peaches are fuzzy, plump, and clean.",
     "Deep, sandy loam soil with excellent root drainage. pH 6.0 - 6.5. Full sunlight.",
     "Add organic compost to root boundaries, prune tree center (open center method) to allow sunlight to lower limbs.",
     "None required.",
     "Thin young peach fruits in early summer to maximize fruit sizing, and monitor tree base for peach tree borers."),

    # RASPBERRY
    ("Raspberry", "Healthy",
     "Excellent health profile for Rubus idaeus canes.",
     "Foliage is green and serrated. Canes are sturdy, bearing plenty of sweet, bright red, soft berries.",
     "Rich, organic, well-draining soil. pH 5.5 - 6.5. Thick woodchip mulch.",
     "Top-dress root systems with woodchips, fertilize with composted manure in early spring, and support canes on wires.",
     "None required.",
     "Prune floricanes (fruiting canes) to ground level after harvest, leaving primocanes to grow for next year."),

    # SOYBEAN
    ("Soybean", "Healthy",
     "Optimal health profile for Glycine max fields.",
     "Foliage is trifoliate, green, and healthy. Stems are strong, bearing dense pods packed with firm green soybeans.",
     "Well-aerated soil with active nitrogen-fixing Rhizobium bacteria. Neutral pH.",
     "Inoculate seeds with Rhizobium bacteria before sowing to promote natural nitrogen nodules on roots.",
     "None required.",
     "Manage weeds early in the crop cycle, and monitor pods for stink bugs."),

    # SUGARCANE
    ("Sugarcane", "Yellow Leaf",
     "A viral disease causing leaf yellowing and severe cane stunting.",
     "Middle leaf vein (midrib) turns bright yellow on the underside, spreading into the blade. Canes are thin and stunted.",
     "Sugarcane Yellow Leaf Virus (SCYLV), spread by the sugarcane aphid (Melanaphis sacchari) and infected seed cuttings.",
     "Use disease-free seed cane. Control aphids early with organic insecticidal soap or neem oil.",
     "Apply systemic insecticides in commercial fields to control aphid vectors during crop emergence.",
     "Select virus-resistant sugarcane varieties, and uproot and destroy stunted diseased stools."),

    ("Sugarcane", "Smut",
     "A highly visible fungal disease replacing the terminal shoot with a long, black, whip-like fungal structure.",
     "A long, dusty black, whip-like structure emerges from the whorl of the stem, covered in millions of spores.",
     "Sporisorium scitamineum fungus, entering buds during irrigation or rain splash.",
     "Plant smut-resistant cane varieties. Manually bag and uproot smutted stools carefully to prevent spore dispersion.",
     "Dip seed cuttings in systemic fungicides (propiconazole) before planting to kill latent fungal spores.",
     "Examine stools before row closure, rotate fields with legumes, and avoid overhead sprinkler systems."),

    ("Sugarcane", "Healthy",
     "Vigorous health profile for Saccharum officinarum stalks.",
     "Stalks are thick, tall, and heavy. Leaves are long, green, and free of rust spots, showing optimal sugar brix levels.",
     "Deep, moist, well-drained fertile clay-loam soil. High water and nitrogen availability.",
     "Apply heavy organic compost and composted manure. Water deeply weekly during vegetative elongation.",
     "None required.",
     "Control soil weeds early, prune dead leaves from base stalks (detrash) to allow air, and check for stalk borers.")
]

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Enable schema
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS diseases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop TEXT NOT NULL,
        disease_name TEXT NOT NULL,
        overview TEXT,
        symptoms TEXT,
        causes TEXT,
        treatment_organic TEXT,
        treatment_chemical TEXT,
        prevention TEXT,
        UNIQUE(crop, disease_name)
    )
    """)
    
    conn.commit()
    conn.close()

def seed_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    print(f"Seeding {len(DISEASES_DATA)} crop disease reference records...")
    
    for row in DISEASES_DATA:
        try:
            cursor.execute("""
            INSERT OR REPLACE INTO diseases 
            (crop, disease_name, overview, symptoms, causes, treatment_organic, treatment_chemical, prevention)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, row)
        except Exception as e:
            print(f"Error seeding row {row[0]}-{row[1]}: {e}")
            
    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    init_db()
    seed_db()
