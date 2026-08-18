// Original first-foods database for baby-led weaning.
// Serving guidance is organized by age band: 6 = 6–8mo, 9 = 9–11mo, 12 = 12mo+.
// hazard: 'high' | 'moderate' | 'low' (choking risk when prepared incorrectly)
// allergen: one of the 9 common allergens, or null.
// This is general guidance, not medical advice — always consult your pediatrician.

export const CATEGORIES = [
  { id: 'fruit', label: 'Fruits', emoji: '🍎' },
  { id: 'vegetable', label: 'Vegetables', emoji: '🥦' },
  { id: 'protein', label: 'Meat, Fish & Eggs', emoji: '🍗' },
  { id: 'grain', label: 'Grains', emoji: '🌾' },
  { id: 'dairy', label: 'Dairy', emoji: '🧀' },
  { id: 'legume', label: 'Beans & Legumes', emoji: '🫘' },
  { id: 'nutseed', label: 'Nuts & Seeds', emoji: '🥜' },
]

export const ALLERGENS = {
  egg: 'Egg',
  peanut: 'Peanut',
  treenut: 'Tree nut',
  milk: 'Milk',
  soy: 'Soy',
  wheat: 'Wheat',
  fish: 'Fish',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
}

export const FOODS = [
  // ---------- FRUITS ----------
  {
    id: 'avocado', name: 'Avocado', emoji: '🥑', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Loaded with healthy fats for brain development, plus folate and fiber.',
    serve: {
      6: 'Offer thick spears (about the size of two adult fingers) of ripe avocado. Roll in a little ground flax or crushed baby cereal for grip. Mashed avocado on a preloaded spoon also works well.',
      9: 'Cut into bite-size cubes for developing pincer grasp, or keep offering spears. Mash onto strips of toast.',
      12: 'Serve diced, sliced, or mashed — on toast, in quesadillas, or straight with a fork.',
    },
  },
  {
    id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Easy energy with potassium and vitamin B6. Very ripe bananas are easiest to digest.',
    serve: {
      6: 'Snap a ripe banana in half and leave some peel on the bottom half as a natural handle, or cut into thick spears. Whole banana rounds are slippery — avoid coin shapes.',
      9: 'Offer small bite-size pieces for pincer-grasp practice, or continue with spears.',
      12: 'Sliced, whole (supervised), or mashed into oatmeal and yogurt.',
    },
  },
  {
    id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'high', ironRich: false,
    hazardNote: 'Raw apple is a top choking hazard for babies and toddlers. Always cook until soft, grate raw, or slice paper-thin for older toddlers.',
    nutrition: 'Fiber and vitamin C. Cooking softens it and makes nutrients easier to access.',
    serve: {
      6: 'Steam or bake peeled apple halves or thick wedges until completely soft (a fork slides in easily). Serve warm wedges or mash into a chunky sauce.',
      9: 'Soft-cooked bite-size pieces, or finely grated raw apple. Unsweetened applesauce on a preloaded spoon.',
      12: 'Continue cooked pieces or grated raw. Whole raw apple and thick raw slices remain choking hazards until at least age 4.',
    },
  },
  {
    id: 'pear', name: 'Pear', emoji: '🍐', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Firm pear poses a choking risk. Use very ripe, soft pears or cook until soft.',
    nutrition: 'Gentle on digestion with good fiber — helpful for constipation, common when starting solids.',
    serve: {
      6: 'Very ripe, soft pear in thick wedges with skin removed, or steam firmer pears until soft. Mashed ripe pear works too.',
      9: 'Soft ripe pear in bite-size pieces, or grated raw.',
      12: 'Sliced ripe pear. Firm varieties still benefit from thin slicing or cooking.',
    },
  },
  {
    id: 'strawberry', name: 'Strawberry', emoji: '🍓', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Small round berries can block airways. Serve large berries whole only when soft and bigger than baby\'s mouth, otherwise slice or quarter.',
    nutrition: 'Excellent vitamin C, which boosts iron absorption when served with iron-rich foods.',
    serve: {
      6: 'Offer large, very ripe berries whole (bigger than a golf ball) for gnawing, or mash smaller ones into yogurt or oatmeal.',
      9: 'Quarter or slice berries lengthwise for self-feeding with pincer grasp.',
      12: 'Halved or quartered depending on size. Whole small berries remain a hazard until around age 4.',
    },
  },
  {
    id: 'blueberry', name: 'Blueberry', emoji: '🫐', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'high', ironRich: false,
    hazardNote: 'Whole blueberries are the classic size and shape to block a baby\'s airway. Always flatten or halve.',
    nutrition: 'Antioxidant-rich with vitamin C and fiber.',
    serve: {
      6: 'Squash each berry flat between your fingers, or stir mashed berries into oatmeal or yogurt.',
      9: 'Flattened or halved berries for pincer-grasp practice.',
      12: 'Halved berries. Whole blueberries become okay when chewing is strong, typically age 2+ with supervision.',
    },
  },
  {
    id: 'mango', name: 'Mango', emoji: '🥭', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Vitamins A and C for immune health and eyesight.',
    serve: {
      6: 'Thick spears of ripe mango (slippery — a crinkle cutter or a roll in baby cereal helps). A large de-fleshed pit with some flesh attached makes a great teether under supervision.',
      9: 'Bite-size cubes of ripe mango.',
      12: 'Cubed or sliced, in yogurt, smoothies, or on its own.',
    },
  },
  {
    id: 'peach', name: 'Peach', emoji: '🍑', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Firm peach flesh can break into hard chunks. Use very ripe fruit or cook until soft. Remove the pit.',
    nutrition: 'Vitamins A and C plus fiber.',
    serve: {
      6: 'Very ripe peach halves (pit removed, skin on for grip) to gnaw, or thick soft wedges. Steam firm peaches until soft.',
      9: 'Ripe peach in bite-size pieces, skin removed if it bothers baby.',
      12: 'Sliced ripe peach.',
    },
  },
  {
    id: 'orange', name: 'Orange', emoji: '🍊', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Membranes can be hard to manage. Remove seeds and tough membrane for young babies.',
    nutrition: 'Classic vitamin C source — pairs beautifully with iron-rich meals.',
    serve: {
      6: 'Offer a large peeled wheel with membrane pierced, or supremed segments (membrane removed) cut small. Citrus may cause harmless rash around the mouth.',
      9: 'Small pieces of supremed segments.',
      12: 'Segments with thin membrane are usually manageable; halve them if large.',
    },
  },
  {
    id: 'watermelon', name: 'Watermelon', emoji: '🍉', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Chunks can break off in hard pieces; remove all seeds.',
    nutrition: 'Hydrating with vitamins A and C.',
    serve: {
      6: 'Thick seedless spears or a large thin wide slice to gnaw. Remove every seed.',
      9: 'Bite-size seedless pieces.',
      12: 'Small triangles or cubes, seeds removed.',
    },
  },
  {
    id: 'grape', name: 'Grapes', emoji: '🍇', category: 'fruit',
    minAge: 9, allergen: null, hazard: 'high', ironRich: false,
    hazardNote: 'Whole grapes are one of the top causes of fatal choking in young children. ALWAYS quarter lengthwise until at least age 4.',
    nutrition: 'Quick energy, vitamin K and hydration.',
    serve: {
      6: 'Best to wait, or offer only as a smashed/quartered mash. Whole or halved grapes are never safe at this age.',
      9: 'Quarter lengthwise (never crosswise into rounds). Skin can be peeled for younger eaters.',
      12: 'Continue quartering lengthwise until at least age 4 — this is non-negotiable.',
    },
  },
  {
    id: 'kiwi', name: 'Kiwi', emoji: '🥝', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'More vitamin C per gram than oranges. Acidity may cause harmless mouth rash.',
    serve: {
      6: 'Peel and cut into thick spears, or halve and let baby scoop with a spoon assist.',
      9: 'Peeled, in bite-size pieces.',
      12: 'Sliced or diced; some toddlers enjoy halved kiwi with a spoon.',
    },
  },
  {
    id: 'cherry', name: 'Cherries', emoji: '🍒', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'high', ironRich: false,
    hazardNote: 'Round, firm, and slippery with a pit — a serious choking hazard whole. Always pit and quarter or chop.',
    nutrition: 'Antioxidants and a little melatonin — some families swear by better naps.',
    serve: {
      6: 'Pit and mash, or chop finely and stir into yogurt or oatmeal.',
      9: 'Pitted and quartered.',
      12: 'Pitted and halved or quartered until chewing is reliable (about age 4 for whole).',
    },
  },
  // ---------- VEGETABLES ----------
  {
    id: 'sweet-potato', name: 'Sweet Potato', emoji: '🍠', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Beta-carotene (vitamin A) powerhouse for eyes and immunity. Naturally sweet — an easy early win.',
    serve: {
      6: 'Roast or steam skin-on wedges until very soft, then remove skin. Thick spears baby can palm, or mash on a preloaded spoon.',
      9: 'Soft-cooked bite-size cubes, or continue wedges.',
      12: 'Cubes, wedges, mash — or baked whole and scooped.',
    },
  },
  {
    id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Vitamin C, vitamin K, folate and fiber. The floret shape is nature\'s baby handle.',
    serve: {
      6: 'Steam whole florets with a long stem until soft. Baby holds the stem and gnaws the floret — a perfect natural handle.',
      9: 'Smaller soft-cooked florets or bite-size pieces.',
      12: 'Bite-size cooked pieces; try roasted with olive oil and a squeeze of lemon.',
    },
  },
  {
    id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'high', ironRich: false,
    hazardNote: 'Raw carrot is a top choking hazard. Always cook until soft, or grate raw for toddlers.',
    nutrition: 'Beta-carotene for vision and immune health.',
    serve: {
      6: 'Steam or roast thick sticks or halved large carrots until a fork slides in easily. Mashed cooked carrot also works.',
      9: 'Soft-cooked bite-size pieces or continue soft sticks.',
      12: 'Soft-cooked pieces, or finely grated raw. Raw sticks and coins stay off the menu until at least age 4.',
    },
  },
  {
    id: 'peas', name: 'Peas', emoji: '🟢', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Small and round — flatten or mash for young babies.',
    nutrition: 'Plant protein, iron, and fiber in a tiny package.',
    serve: {
      6: 'Mash or flatten cooked peas, or blend into a chunky mash on a preloaded spoon.',
      9: 'Whole cooked peas are generally fine now and excellent pincer practice — flatten them if you want extra caution.',
      12: 'Whole cooked peas, in pasta, rice, or straight off the tray.',
    },
  },
  {
    id: 'green-beans', name: 'Green Beans', emoji: '🫛', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Vitamin K, folate and fiber.',
    serve: {
      6: 'Steam whole beans until very soft — the long shape is easy to hold and gnaw.',
      9: 'Soft-cooked beans cut into small pieces, or continue whole soft beans.',
      12: 'Cooked pieces; roasted green beans make a great finger food.',
    },
  },
  {
    id: 'zucchini', name: 'Zucchini', emoji: '🥒', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Mild, hydrating, and easy to cook soft — a low-stress early vegetable.',
    serve: {
      6: 'Steam or roast thick spears (skin on for grip) until soft.',
      9: 'Soft-cooked half-moons or bite-size pieces.',
      12: 'Cooked pieces, grated into fritters, or ribboned into pasta.',
    },
  },
  {
    id: 'butternut-squash', name: 'Butternut Squash', emoji: '🎃', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Beta-carotene and vitamin C with a naturally sweet flavor babies love.',
    serve: {
      6: 'Roast or steam wedges until very soft; serve thick spears or mash.',
      9: 'Soft-cooked cubes.',
      12: 'Cubes, mash, or blended into pasta sauce and soups.',
    },
  },
  {
    id: 'potato', name: 'Potato', emoji: '🥔', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Energy, potassium and vitamin C. A neutral base for stronger flavors.',
    serve: {
      6: 'Steamed or baked wedges, soft all the way through. Mashed potato (thin with breast milk or formula) on a preloaded spoon.',
      9: 'Soft-cooked bite-size pieces or small smashed potatoes.',
      12: 'Any soft preparation — wedges, mash, shredded hash browns cooked soft.',
    },
  },
  {
    id: 'cauliflower', name: 'Cauliflower', emoji: '🥬', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Vitamin C and fiber; can cause some gas — normal and temporary.',
    serve: {
      6: 'Steam whole florets with stems until soft; baby grips the stem.',
      9: 'Small soft-cooked florets or pieces.',
      12: 'Roasted florets, riced cauliflower, or in cheese sauce.',
    },
  },
  {
    id: 'spinach', name: 'Spinach', emoji: '🥬', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Iron, folate and vitamin K. Pair with vitamin C foods to boost iron absorption.',
    serve: {
      6: 'Finely chop cooked spinach and fold into scrambled egg yolk, oatmeal, or mashed vegetables. Raw leaves can stick to the palate — cook it.',
      9: 'Chopped cooked spinach in eggs, pasta, fritters, or yogurt dips.',
      12: 'Cooked and chopped in almost anything; some toddlers accept small raw leaves torn up.',
    },
  },
  {
    id: 'tomato', name: 'Tomato', emoji: '🍅', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Cherry and grape tomatoes are round choking hazards — always quarter lengthwise.',
    nutrition: 'Vitamin C and lycopene. Acidity can cause harmless rash around the mouth.',
    serve: {
      6: 'Large tomato wedges (seeds okay), or quartered cherry tomatoes. Low-sodium tomato sauce on pasta is great too.',
      9: 'Quartered cherry tomatoes or diced large tomato.',
      12: 'Diced tomato; keep quartering cherry tomatoes until at least age 4.',
    },
  },
  {
    id: 'cucumber', name: 'Cucumber', emoji: '🥒', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Firm raw chunks and coins are risky. Use large spears for gnawing or thin ribbons.',
    nutrition: 'Mostly water — hydrating and soothing for teething gums (try it cold).',
    serve: {
      6: 'A thick, long spear with skin on for grip (baby gnaws, doesn\'t really eat much) — stay close. Cold cucumber soothes gums.',
      9: 'Thin ribbons (use a peeler) or small thin slices.',
      12: 'Thin slices or quartered spears. Avoid thick coins until chewing is reliable.',
    },
  },
  {
    id: 'corn', name: 'Corn', emoji: '🌽', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Loose kernels can be inhaled by young babies; on the cob is safer early on.',
    nutrition: 'Fiber, B vitamins and energy.',
    serve: {
      6: 'Cooked corn on the cob (halved crosswise) — baby gnaws kernels off, which is safer than loose kernels. Or blend kernels into a mash.',
      9: 'Loose cooked kernels are usually okay now; flatten them for extra caution.',
      12: 'On the cob or loose kernels.',
    },
  },
  {
    id: 'beet', name: 'Beets', emoji: '🟣', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Raw or undercooked beet is hard and risky — cook until completely soft.',
    nutrition: 'Folate and antioxidants. Heads up: red beets turn diapers pink — harmless!',
    serve: {
      6: 'Roast or steam until very soft; serve thick wedges or mash.',
      9: 'Soft-cooked bite-size pieces (expect glorious mess).',
      12: 'Cooked pieces or grated raw in small amounts.',
    },
  },
  {
    id: 'bell-pepper', name: 'Bell Pepper', emoji: '🫑', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Raw pepper is firm and the skin is slippery. Cook soft for babies; thin raw strips for toddlers.',
    nutrition: 'One of the best vitamin C sources in the produce aisle.',
    serve: {
      6: 'Roast or steam wide strips until soft, skin removed if tough.',
      9: 'Soft-cooked small pieces, or very thin raw strips to gnaw.',
      12: 'Thin raw strips or cooked pieces.',
    },
  },
  {
    id: 'mushroom', name: 'Mushrooms', emoji: '🍄', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Rubbery texture is hard to chew — cook well and chop.',
    nutrition: 'B vitamins, selenium, and vitamin D when UV-exposed.',
    serve: {
      6: 'Cook well (sautéed or roasted until tender) and chop finely into eggs, pasta, or mash.',
      9: 'Well-cooked, chopped small.',
      12: 'Cooked slices or quarters.',
    },
  },
  // ---------- PROTEIN: MEAT, FISH, EGGS ----------
  {
    id: 'egg', name: 'Egg', emoji: '🥚', category: 'protein',
    minAge: 6, allergen: 'egg', hazard: 'low', ironRich: true,
    nutrition: 'Nearly a complete food: protein, choline for brain development, iron, and vitamin D.',
    serve: {
      6: 'Introduce early and keep it regular — early introduction may reduce allergy risk. Serve a well-cooked omelet cut into strips, or hard-boiled egg mashed with a little water, breast milk, or formula.',
      9: 'Scrambled egg pieces, omelet strips, or quartered hard-boiled eggs.',
      12: 'Any fully-cooked style: scrambled, boiled, egg cups, French toast fingers.',
    },
  },
  {
    id: 'chicken', name: 'Chicken', emoji: '🍗', category: 'protein',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Dry, crumbly chunks are hard to manage. Keep it moist; shred or serve large pieces to gnaw.',
    nutrition: 'Protein, iron and zinc — dark meat (thigh) has more iron and stays moister.',
    serve: {
      6: 'A whole cooked drumstick (skin, cartilage and loose bone fragments removed) makes a natural handle — baby gnaws and sucks. Or finely shredded moist thigh meat, or blended chicken folded into mash.',
      9: 'Finely shredded or thin small strips of moist chicken; meatballs made soft with breadcrumbs.',
      12: 'Shredded, diced, or soft meatballs. Avoid tough dry chunks.',
    },
  },
  {
    id: 'beef', name: 'Beef', emoji: '🥩', category: 'protein',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Chunks of steak are a hazard. Serve as a large piece to suck/gnaw, or ground and soft.',
    nutrition: 'One of the best iron sources for babies — heme iron absorbs far better than plant iron.',
    serve: {
      6: 'A large strip of soft-cooked steak to hold and suck the juices (baby gnaws, swallows little), or well-cooked ground beef mixed into mash. Slow-cooked shredded beef is ideal.',
      9: 'Ground beef, soft meatballs, or finely shredded slow-cooked beef.',
      12: 'Small tender pieces, meatballs, bolognese, or shredded beef tacos.',
    },
  },
  {
    id: 'salmon', name: 'Salmon', emoji: '🐟', category: 'protein',
    minAge: 6, allergen: 'fish', hazard: 'low', ironRich: true,
    nutrition: 'Omega-3 DHA for brain and eye development, plus protein, iron and vitamin D.',
    serve: {
      6: 'Cooked salmon flaked and checked meticulously for bones, served in small clumps or mixed into mash or avocado. Introduce early — fish is a common allergen.',
      9: 'Flaked salmon, salmon patties, or small pieces.',
      12: 'Flaked fillet, salmon cakes, or mixed into pasta and rice.',
    },
  },
  {
    id: 'white-fish', name: 'White Fish (Cod)', emoji: '🐠', category: 'protein',
    minAge: 6, allergen: 'fish', hazard: 'low', ironRich: false,
    nutrition: 'Mild, lean protein with B12 and selenium — a gentle first fish.',
    serve: {
      6: 'Poach or bake, check thoroughly for bones, and flake into soft clumps or fold into mashed potato.',
      9: 'Flaked pieces or soft fish cakes.',
      12: 'Flaked fish, fish cakes, or homemade fish fingers (baked soft).',
    },
  },
  {
    id: 'shrimp', name: 'Shrimp', emoji: '🦐', category: 'protein',
    minAge: 6, allergen: 'shellfish', hazard: 'moderate', ironRich: true,
    hazardNote: 'Rubbery texture — chop finely for young babies.',
    nutrition: 'Lean protein with iodine, selenium and B12. Shellfish is a common allergen — introduce deliberately.',
    serve: {
      6: 'Cook well and chop very finely, mixed into mash, congee, or scrambled eggs.',
      9: 'Finely chopped cooked shrimp.',
      12: 'Small pieces of well-cooked shrimp (halve lengthwise, then chop).',
    },
  },
  {
    id: 'turkey', name: 'Turkey', emoji: '🦃', category: 'protein',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Dry turkey is crumbly and hard to manage. Keep it moist; thighs over breast.',
    nutrition: 'Protein, iron and zinc, similar to chicken; dark meat is richer in iron.',
    serve: {
      6: 'Moist shredded thigh meat, or soft turkey meatballs mashed into pieces. Ground turkey folded into vegetable mash works well.',
      9: 'Soft meatballs, ground turkey, or fine shreds.',
      12: 'Meatballs, patties, shredded or diced moist turkey.',
    },
  },
  {
    id: 'pork', name: 'Pork', emoji: '🐖', category: 'protein',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Chops and dry chunks are tough. Slow-cooked and shredded is safest.',
    nutrition: 'Protein, iron, zinc and thiamine.',
    serve: {
      6: 'Slow-cooked pork shredded finely, or a large strip of tender pork to gnaw. Avoid processed pork (bacon, sausage) — very high sodium.',
      9: 'Finely shredded pulled pork or soft ground-pork meatballs.',
      12: 'Shredded or small tender pieces.',
    },
  },
  {
    id: 'tofu', name: 'Tofu', emoji: '⬜', category: 'protein',
    minAge: 6, allergen: 'soy', hazard: 'low', ironRich: true,
    nutrition: 'Plant protein, calcium and iron. Soy is a common allergen — introduce on purpose.',
    serve: {
      6: 'Thick strips of firm tofu (roll in crushed cereal or hemp seeds for grip), or mashed silken tofu on a spoon.',
      9: 'Cubes of firm tofu, plain or lightly pan-seared.',
      12: 'Cubes, strips, scrambled tofu, or in soups.',
    },
  },
  {
    id: 'liver', name: 'Chicken Liver', emoji: '🟤', category: 'protein',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'The single richest common source of iron and vitamin A. Serve small amounts about once a week — vitamin A is potent.',
    serve: {
      6: 'Cook thoroughly and mash into a smooth pâté; spread thinly on toast strips or stir a spoonful into vegetable mash.',
      9: 'Pâté on toast strips, or small soft pieces mixed into other foods.',
      12: 'Pâté, or blended into meatballs and bolognese.',
    },
  },
  // ---------- GRAINS ----------
  {
    id: 'oats', name: 'Oatmeal', emoji: '🥣', category: 'grain',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Fiber, plant iron (choose fortified baby oatmeal for more), and steady energy.',
    serve: {
      6: 'Thick oatmeal on a preloaded spoon, or so thick baby can grab handfuls. Mix with mashed fruit, breast milk, or formula.',
      9: 'Thick oatmeal for spoon practice; baked oatmeal fingers for self-feeding.',
      12: 'Any style — porridge, overnight oats, oat pancakes.',
    },
  },
  {
    id: 'bread', name: 'Bread & Toast', emoji: '🍞', category: 'grain',
    minAge: 6, allergen: 'wheat', hazard: 'moderate', ironRich: false,
    hazardNote: 'Fresh soft bread can gum into a sticky ball. Lightly toast it for babies.',
    nutrition: 'Choose low-sodium, whole-grain bread. Wheat is a common allergen — introduce deliberately.',
    serve: {
      6: 'Lightly toasted strips topped with a thin spread (avocado, hummus, thinned nut butter). Avoid untoasted fluffy bread.',
      9: 'Toast strips or small pieces with spreads.',
      12: 'Toast, sandwiches cut into strips, pita triangles.',
    },
  },
  {
    id: 'pasta', name: 'Pasta', emoji: '🍝', category: 'grain',
    minAge: 6, allergen: 'wheat', hazard: 'low', ironRich: false,
    nutrition: 'Energy and (if fortified) B vitamins and iron. A friendly vehicle for sauces, fish and vegetables.',
    serve: {
      6: 'Large shapes cooked very soft: fusilli, rigatoni, or thick strips of lasagna sheet. Toss with olive oil or low-sodium sauce.',
      9: 'Cooked-soft shapes of any size; cut long noodles.',
      12: 'Any pasta, any sauce (watch sodium in jarred sauces).',
    },
  },
  {
    id: 'rice', name: 'Rice', emoji: '🍚', category: 'grain',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Gentle energy. Vary grains (oats, barley, quinoa) to limit arsenic exposure from rice.',
    serve: {
      6: 'Cook sticky/overcooked so it clumps — baby grabs handfuls. Congee (rice porridge) on a preloaded spoon is perfect.',
      9: 'Sticky rice clumps, rice balls, or spoon-fed congee.',
      12: 'Regular rice with meals.',
    },
  },
  {
    id: 'quinoa', name: 'Quinoa', emoji: '🌾', category: 'grain',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'A complete plant protein with iron and fiber.',
    serve: {
      6: 'Cook until very soft and fold into mash, yogurt, or thick porridge — the grains are too small to pick up alone.',
      9: 'Quinoa mixed into soft foods, or formed into small baked patties.',
      12: 'As a side grain, in bowls and salads.',
    },
  },
  {
    id: 'pancake', name: 'Pancakes', emoji: '🥞', category: 'grain',
    minAge: 6, allergen: 'wheat', hazard: 'low', ironRich: false,
    nutrition: 'A perfect vehicle: fold in banana, ricotta, spinach, or ground flax. Skip syrup for babies.',
    serve: {
      6: 'Soft, thin pancake strips (about two adult fingers wide). Sweeten with mashed banana, not sugar or honey (no honey before 12 months).',
      9: 'Strips or small pieces.',
      12: 'Quartered or whole small pancakes. Honey is okay now (after the first birthday).',
    },
  },
  // ---------- DAIRY ----------
  {
    id: 'yogurt', name: 'Yogurt', emoji: '🥛', category: 'dairy',
    minAge: 6, allergen: 'milk', hazard: 'low', ironRich: false,
    nutrition: 'Protein, calcium, and probiotics. Choose plain whole-milk yogurt — flavored ones are sugar bombs.',
    serve: {
      6: 'Plain whole-milk yogurt on a preloaded spoon, or let baby dive in with hands (embrace the mess). Stir in mashed fruit.',
      9: 'Spoon practice with thick yogurt; use as a dip for fruit and toast.',
      12: 'Yogurt with fruit, in smoothies, as a dip base.',
    },
  },
  {
    id: 'cheese', name: 'Cheese', emoji: '🧀', category: 'dairy',
    minAge: 6, allergen: 'milk', hazard: 'moderate', ironRich: false,
    hazardNote: 'Cubes and chunks of firm cheese are choking hazards. Serve thin slices, shreds, or melted.',
    nutrition: 'Calcium, protein and fat. Pick low-sodium options: fresh mozzarella, ricotta, Swiss.',
    serve: {
      6: 'Thin strips of fresh mozzarella, ricotta spread on toast, or melted into vegetables. Skip high-sodium cheeses most days.',
      9: 'Shredded cheese, thin slices, ricotta by the spoon.',
      12: 'Shreds, thin slices, melted — avoid cubes until chewing is strong.',
    },
  },
  {
    id: 'butter', name: 'Butter & Ghee', emoji: '🧈', category: 'dairy',
    minAge: 6, allergen: 'milk', hazard: 'low', ironRich: false,
    nutrition: 'Energy-dense fat that helps absorb vitamins A, D, E and K. Use unsalted.',
    serve: {
      6: 'Melt a little unsalted butter into vegetables, oatmeal, or eggs — adds calories and flavor.',
      9: 'Same — a cooking fat and flavor booster.',
      12: 'Spread thinly on toast; cook with it freely.',
    },
  },
  {
    id: 'cottage-cheese', name: 'Cottage Cheese', emoji: '🥛', category: 'dairy',
    minAge: 6, allergen: 'milk', hazard: 'low', ironRich: false,
    nutrition: 'Very high protein. Look for low-sodium versions for babies.',
    serve: {
      6: 'Low-sodium cottage cheese on a preloaded spoon or mixed with mashed fruit.',
      9: 'By the spoonful, or as a dip/topping on toast strips.',
      12: 'With fruit, on toast, in pancake batter.',
    },
  },
  // ---------- LEGUMES ----------
  {
    id: 'lentils', name: 'Lentils', emoji: '🟠', category: 'legume',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Plant iron, protein, folate and fiber. Pair with vitamin C for better iron absorption.',
    serve: {
      6: 'Cook until very soft (red lentils collapse nicely) and serve as thick dal on a preloaded spoon, or fold into mash.',
      9: 'Thick lentil stews, lentil patties, or mixed into rice.',
      12: 'Dal, soups, patties — lentils in any form.',
    },
  },
  {
    id: 'chickpeas', name: 'Chickpeas', emoji: '🟡', category: 'legume',
    minAge: 6, allergen: null, hazard: 'high', ironRich: true,
    hazardNote: 'Whole chickpeas are round and firm — always smash or mash for babies.',
    nutrition: 'Protein, iron, folate and fiber.',
    serve: {
      6: 'Smooth hummus (low-sodium, no whole seeds) spread on toast strips, or well-cooked chickpeas mashed thoroughly.',
      9: 'Flattened/smashed chickpeas for pincer practice; hummus as a dip.',
      12: 'Smashed or halved chickpeas; whole soft-cooked around 18mo+ with good chewing.',
    },
  },
  {
    id: 'black-beans', name: 'Black Beans', emoji: '⚫', category: 'legume',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Whole beans can be a hazard for young babies — flatten or mash at first.',
    nutrition: 'Iron, protein, folate and fiber.',
    serve: {
      6: 'Mash well-cooked (low-sodium) beans into a paste; spread on toast or mix into avocado.',
      9: 'Flattened whole beans for finger practice, or mashed.',
      12: 'Whole soft beans, bean quesadillas, soups.',
    },
  },
  {
    id: 'edamame', name: 'Edamame', emoji: '🟢', category: 'legume',
    minAge: 9, allergen: 'soy', hazard: 'high', ironRich: true,
    hazardNote: 'Firm, round and smooth — a real choking hazard whole. Always smash or chop; never serve in the pod to babies.',
    nutrition: 'Complete plant protein with iron and folate.',
    serve: {
      6: 'Best mashed into a smooth paste or blended into purees at this age.',
      9: 'Smashed flat or finely chopped, shelled only.',
      12: 'Halved or smashed shelled beans; whole around age 2+ with strong chewing.',
    },
  },
  // ---------- NUTS & SEEDS ----------
  {
    id: 'peanut-butter', name: 'Peanut Butter', emoji: '🥜', category: 'nutseed',
    minAge: 6, allergen: 'peanut', hazard: 'high', ironRich: false,
    hazardNote: 'Thick glops of nut butter can block airways, and whole peanuts are unsafe until age 4+. Always thin it or spread thinly.',
    nutrition: 'Early, regular peanut introduction is linked to dramatically lower allergy risk (LEAP study). Protein, healthy fat, niacin.',
    serve: {
      6: 'Thin smooth peanut butter with warm water, breast milk or formula into a drizzle; stir into oatmeal or yogurt, or spread paper-thin on toast. Never by the spoonful, never chunky.',
      9: 'Thinly spread on toast strips or mixed into foods, several times a week to maintain tolerance.',
      12: 'Thin spreads and mixed into foods. Whole peanuts remain off-limits until at least age 4.',
    },
  },
  {
    id: 'almond-butter', name: 'Almond Butter', emoji: '🌰', category: 'nutseed',
    minAge: 6, allergen: 'treenut', hazard: 'high', ironRich: false,
    hazardNote: 'Same rules as peanut butter: thin it out or spread paper-thin. Whole almonds are unsafe until age 4+.',
    nutrition: 'Vitamin E, magnesium and healthy fats. Tree nuts are a common allergen — introduce one at a time.',
    serve: {
      6: 'Thin smooth almond butter into oatmeal, yogurt, or a paper-thin toast spread.',
      9: 'Thin spreads and mix-ins, offered regularly.',
      12: 'Thin spreads; finely ground almonds in baking. No whole nuts until 4+.',
    },
  },
  {
    id: 'tahini', name: 'Tahini (Sesame)', emoji: '🫙', category: 'nutseed',
    minAge: 6, allergen: 'sesame', hazard: 'moderate', ironRich: true,
    hazardNote: 'Thick paste can clump — thin it before serving.',
    nutrition: 'Sesame is a top-9 allergen worth introducing early. Tahini brings calcium, iron and healthy fat.',
    serve: {
      6: 'Thin with water and drizzle over vegetables, stir into yogurt, or serve as hummus.',
      9: 'Thinned drizzles, hummus, tahini-yogurt dips.',
      12: 'In dressings, dips and baking.',
    },
  },
  {
    id: 'chia', name: 'Chia Seeds', emoji: '⚫', category: 'nutseed',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Omega-3 ALA, fiber, iron and calcium in a sprinkle.',
    serve: {
      6: 'Stir a small spoonful into oatmeal or yogurt (they soften as they absorb liquid), or make chia pudding.',
      9: 'Chia pudding, sprinkled into porridge and smoothies.',
      12: 'Puddings, smoothies, baked into muffins.',
    },
  },
  {
    id: 'flax', name: 'Ground Flaxseed', emoji: '🟤', category: 'nutseed',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Omega-3 ALA and fiber. Always ground — whole seeds pass through undigested.',
    serve: {
      6: 'Sprinkle ground flax into oatmeal, yogurt, or use it to add grip to slippery foods like avocado and banana.',
      9: 'Mixed into porridge, baking, and smoothies.',
      12: 'Same — a daily sprinkle habit is an easy win.',
    },
  },
  // ---------- MORE FRUITS ----------
  {
    id: 'raspberry', name: 'Raspberries', emoji: '🍓', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Fiber champion of the berry world, with vitamin C and antioxidants.',
    serve: {
      6: 'Soft enough to serve whole if large and ripe — or flatten each berry between your fingers. Mash into yogurt or oatmeal.',
      9: 'Whole ripe berries (flattened if firm) for pincer practice.',
      12: 'Whole or halved berries.',
    },
  },
  {
    id: 'blackberry', name: 'Blackberries', emoji: '🫐', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Large firm blackberries can be a hazard — halve or flatten them.',
    nutrition: 'Vitamin C, vitamin K and fiber.',
    serve: {
      6: 'Halve lengthwise or smash; fold mashed berries into oatmeal or yogurt.',
      9: 'Halved or flattened berries.',
      12: 'Halved berries; whole once chewing is strong.',
    },
  },
  {
    id: 'pineapple', name: 'Pineapple', emoji: '🍍', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Fibrous and firm — serve thin, small or very ripe. Acidity can cause harmless mouth rash.',
    nutrition: 'Vitamin C and manganese, plus bromelain (why your tongue tingles).',
    serve: {
      6: 'A large thin ring or long thin spear of very ripe pineapple to gnaw, or finely chopped into yogurt.',
      9: 'Small thin pieces of ripe pineapple.',
      12: 'Bite-size pieces.',
    },
  },
  {
    id: 'cantaloupe', name: 'Cantaloupe', emoji: '🍈', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Firm melon chunks can break off in hard pieces — use ripe melon, sliced thin.',
    nutrition: 'Beta-carotene and vitamin C in a hydrating package.',
    serve: {
      6: 'Thin wide slices of ripe melon (rind removed) or thick spears soft enough to smash between your fingers.',
      9: 'Small bite-size pieces of ripe melon.',
      12: 'Cubes or small wedges.',
    },
  },
  {
    id: 'plum', name: 'Plum', emoji: '🟣', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Remove the pit; firm plums need cooking or very thin slicing.',
    nutrition: 'Fiber and sorbitol — a gentle constipation helper.',
    serve: {
      6: 'Very ripe plum halves (pit removed, skin on for grip) to gnaw, or steam firm plums until soft.',
      9: 'Ripe plum in bite-size pieces.',
      12: 'Sliced ripe plum.',
    },
  },
  {
    id: 'apricot', name: 'Apricot', emoji: '🟠', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Remove the pit. Dried apricots are sticky and chewy — chop finely if offered.',
    nutrition: 'Beta-carotene and fiber; dried apricots are iron-dense (chop well).',
    serve: {
      6: 'Very ripe apricot halves, pit removed, or steamed until soft and mashed.',
      9: 'Ripe pieces; finely chopped dried apricot softened in warm water.',
      12: 'Sliced fresh, or finely chopped dried apricots.',
    },
  },
  {
    id: 'papaya', name: 'Papaya', emoji: '🧡', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Vitamin C, folate and digestive enzymes — famously gentle on tummies.',
    serve: {
      6: 'Thick spears of ripe papaya (roll in ground flax for grip) or mashed.',
      9: 'Bite-size cubes of ripe papaya.',
      12: 'Cubed or sliced.',
    },
  },
  {
    id: 'fig', name: 'Figs', emoji: '🟤', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Fiber, calcium and potassium; dried figs are concentrated sugar — fresh is better for babies.',
    serve: {
      6: 'Quarter a ripe fresh fig lengthwise, or mash the flesh into oatmeal.',
      9: 'Quartered fresh figs or small pieces.',
      12: 'Halved or quartered fresh figs; finely chopped dried figs.',
    },
  },
  {
    id: 'coconut', name: 'Coconut', emoji: '🥥', category: 'fruit',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Raw coconut chunks are hard — use shredded, flaked or blended forms.',
    nutrition: 'Rich fats for energy. Coconut milk and yogurt are great dairy-free bases.',
    serve: {
      6: 'Stir unsweetened coconut milk into oatmeal and curries, or finely shredded coconut into porridge.',
      9: 'Fine shreds mixed into food; coconut yogurt.',
      12: 'Shredded coconut on yogurt; small thin slivers of fresh coconut.',
    },
  },
  {
    id: 'pomegranate', name: 'Pomegranate', emoji: '🔴', category: 'fruit',
    minAge: 9, allergen: null, hazard: 'high', ironRich: false,
    hazardNote: 'Arils are small, round, firm and slippery — crush them for babies and young toddlers.',
    nutrition: 'Antioxidants, vitamin C and fiber.',
    serve: {
      6: 'Best to wait, or offer only juice-crushed arils stirred into yogurt (seeds crushed flat).',
      9: 'Crush each aril between your fingers before serving, or chop into yogurt.',
      12: 'Crushed or halved arils; whole arils only when chewing is reliable (age 3–4).',
    },
  },
  // ---------- MORE VEGETABLES ----------
  {
    id: 'asparagus', name: 'Asparagus', emoji: '🌱', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'The fibrous stalk can shred into strings — cook until fully soft and trim woody ends.',
    nutrition: 'Folate, vitamin K and prebiotic fiber (may make diapers smell funny — harmless).',
    serve: {
      6: 'Steam or roast thick spears until completely soft; baby holds the stalk and gnaws the tip.',
      9: 'Soft-cooked spears cut into small pieces.',
      12: 'Cooked pieces or whole soft spears.',
    },
  },
  {
    id: 'pumpkin', name: 'Pumpkin', emoji: '🎃', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Beta-carotene, potassium and fiber, with a soft, spoonable texture.',
    serve: {
      6: 'Roast or steam wedges until very soft; serve spears or mash. Plain canned pumpkin stirred into oatmeal works too.',
      9: 'Soft-cooked cubes or thick pumpkin mash.',
      12: 'Cubes, mash, pumpkin pancakes or muffins.',
    },
  },
  {
    id: 'kale', name: 'Kale', emoji: '🥬', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Vitamin K, vitamin C, calcium and some iron.',
    serve: {
      6: 'Cook until very tender and chop finely into eggs, mash, or blended sauces — raw leaves are too tough.',
      9: 'Finely chopped cooked kale mixed into fritters, pasta, or scrambled eggs.',
      12: 'Chopped cooked kale; crispy baked kale pieces for adventurous toddlers.',
    },
  },
  {
    id: 'cabbage', name: 'Cabbage', emoji: '🥬', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Vitamin C and K, plus fiber. Expect some extra gas — normal.',
    serve: {
      6: 'Steam or braise until silky-soft and chop finely into mash or grain dishes.',
      9: 'Soft-cooked, finely chopped or thin soft ribbons.',
      12: 'Cooked ribbons; small amounts of finely shredded raw cabbage in soft slaws.',
    },
  },
  {
    id: 'brussels-sprouts', name: 'Brussels Sprouts', emoji: '🥬', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Whole sprouts are round and firm — always halve or quarter and cook soft.',
    nutrition: 'Vitamin C, vitamin K, folate and fiber.',
    serve: {
      6: 'Steam or roast until very soft, then halve or quarter lengthwise.',
      9: 'Quartered soft-cooked sprouts or chopped leaves.',
      12: 'Halved roasted sprouts, cooked soft.',
    },
  },
  {
    id: 'eggplant', name: 'Eggplant', emoji: '🍆', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Fiber and antioxidants; cooks down to a silky, easy-to-eat texture.',
    serve: {
      6: 'Roast or steam thick spears until collapsing-soft (skin removed if tough), or mash into baba ganoush-style dip.',
      9: 'Soft-cooked pieces or eggplant dip on toast strips.',
      12: 'Cooked pieces, in pasta or curries.',
    },
  },
  {
    id: 'onion', name: 'Onion', emoji: '🧅', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Prebiotic fiber and flavor-building — teaches baby real food tastes.',
    serve: {
      6: 'Cook until fully soft and sweet (sautéed or roasted) and mix into any dish — rarely served alone.',
      9: 'Well-cooked soft onion in eggs, sauces and stews.',
      12: 'Cooked onion in anything; caramelized onion is usually a hit.',
    },
  },
  {
    id: 'garlic', name: 'Garlic', emoji: '🧄', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Flavor and immune-supporting compounds. Babies can love garlic — season their food!',
    serve: {
      6: 'Cooked into dishes — sautéed with vegetables, in sauces, or roasted and mashed into spreads.',
      9: 'Same — a seasoning, not a solo food.',
      12: 'Cooked into family meals; roasted garlic spread on toast.',
    },
  },
  {
    id: 'celery', name: 'Celery', emoji: '🥬', category: 'vegetable',
    minAge: 9, allergen: null, hazard: 'high', ironRich: false,
    hazardNote: 'Raw celery is a classic choking hazard: hard, fibrous and stringy. Cook soft and de-string for babies.',
    nutrition: 'Hydrating with vitamin K; mostly a texture-and-flavor food.',
    serve: {
      6: 'Best finely chopped and cooked soft into soups, stews and sauces.',
      9: 'Soft-cooked, de-stringed small pieces in mixed dishes.',
      12: 'Cooked pieces. Raw celery sticks stay off the menu until at least age 4.',
    },
  },
  {
    id: 'okra', name: 'Okra', emoji: '🟢', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Fiber, vitamin C and folate; the natural sliminess actually helps babies swallow.',
    serve: {
      6: 'Steam or stew whole pods until soft; baby holds the pod and gnaws (remove the stem cap).',
      9: 'Soft-cooked slices or chopped stewed okra.',
      12: 'Stewed, roasted, or in gumbo-style dishes.',
    },
  },
  {
    id: 'parsnip', name: 'Parsnip', emoji: '🥕', category: 'vegetable',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: false,
    hazardNote: 'Like carrot: hard when raw or undercooked. Cook until a fork slides through.',
    nutrition: 'Naturally sweet with fiber, folate and vitamin C.',
    serve: {
      6: 'Roast or steam thick sticks until very soft, or mash with butter.',
      9: 'Soft-cooked bite-size pieces or continue soft sticks.',
      12: 'Roasted pieces or mash.',
    },
  },
  // ---------- MORE PROTEIN ----------
  {
    id: 'lamb', name: 'Lamb', emoji: '🐑', category: 'protein',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Chunks are tough — serve slow-cooked and shredded, ground, or as a large strip to gnaw.',
    nutrition: 'Exceptional iron and zinc — one of the best first meats.',
    serve: {
      6: 'A large strip of slow-cooked lamb to hold and suck, or finely shredded/ground lamb folded into mash.',
      9: 'Ground lamb, soft meatballs or fine shreds.',
      12: 'Small tender pieces, koftas, or shredded slow-cooked lamb.',
    },
  },
  {
    id: 'sardines', name: 'Sardines', emoji: '🐟', category: 'protein',
    minAge: 6, allergen: 'fish', hazard: 'moderate', ironRich: true,
    hazardNote: 'Check for larger bones; the soft tiny bones in canned sardines are safe and full of calcium.',
    nutrition: 'Omega-3s, calcium, iron, vitamin D — tiny fish, huge nutrition, and very low mercury.',
    serve: {
      6: 'Mash canned sardines (in water, low-sodium) thoroughly, remove the spine, and spread on toast strips or mix into mash.',
      9: 'Mashed or flaked sardines, sardine cakes.',
      12: 'Flaked sardines on toast or pasta.',
    },
  },
  {
    id: 'tuna', name: 'Tuna', emoji: '🐟', category: 'protein',
    minAge: 6, allergen: 'fish', hazard: 'low', ironRich: true,
    nutrition: 'Protein and omega-3s. Choose light/skipjack tuna and keep to about once a week — albacore carries more mercury.',
    serve: {
      6: 'Mash canned light tuna (in water, no salt added) with avocado, yogurt or olive oil until moist and clumpy.',
      9: 'Moist flaked tuna, tuna patties, or tuna-avocado mash on toast.',
      12: 'Tuna salad, patties, or flaked into pasta.',
    },
  },
  {
    id: 'crab', name: 'Crab', emoji: '🦀', category: 'protein',
    minAge: 6, allergen: 'shellfish', hazard: 'low', ironRich: true,
    nutrition: 'Lean protein with zinc and B12. Shellfish allergen — introduce deliberately. Use real cooked crab, not imitation (high sodium).',
    serve: {
      6: 'Shred cooked crab meat finely (check for shell fragments) and mix into congee, mash or scrambled egg.',
      9: 'Finely shredded crab in mixed dishes or soft crab cakes.',
      12: 'Crab cakes or shredded crab.',
    },
  },
  {
    id: 'duck', name: 'Duck', emoji: '🦆', category: 'protein',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Serve moist and shredded — dry slices are hard to manage.',
    nutrition: 'Richer in iron than chicken, with plenty of healthy fat.',
    serve: {
      6: 'Slow-roasted duck finely shredded (skin removed) and folded into mash or rice.',
      9: 'Moist shredded duck or small soft pieces.',
      12: 'Shredded or diced tender duck.',
    },
  },
  {
    id: 'tempeh', name: 'Tempeh', emoji: '🟫', category: 'protein',
    minAge: 6, allergen: 'soy', hazard: 'low', ironRich: true,
    nutrition: 'Fermented soy with protein, iron and probiotics; firmer and nuttier than tofu.',
    serve: {
      6: 'Steam or simmer thick strips until soft (simmering mellows bitterness), or crumble finely into sauces.',
      9: 'Soft-cooked strips or crumbles in mixed dishes.',
      12: 'Pan-seared strips or crumbles in tacos and stir-fries.',
    },
  },
  // ---------- MORE GRAINS ----------
  {
    id: 'barley', name: 'Barley', emoji: '🌾', category: 'grain',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Chewy whole grain with beta-glucan fiber. Contains gluten.',
    serve: {
      6: 'Cook pearl barley until very soft and fold into thick soups or mash — grains are too small to pick up alone.',
      9: 'Soft-cooked barley in stews and grain bowls.',
      12: 'Barley in soups, salads and pilafs.',
    },
  },
  {
    id: 'millet', name: 'Millet', emoji: '🌾', category: 'grain',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Gluten-free grain with iron, magnesium and B vitamins.',
    serve: {
      6: 'Cook into a soft porridge (like polenta) and serve on a preloaded spoon or as set, cooled wedges.',
      9: 'Millet porridge, or millet cooked sticky and formed into small balls.',
      12: 'Fluffy millet as a side, or porridge with fruit.',
    },
  },
  {
    id: 'couscous', name: 'Couscous', emoji: '🍚', category: 'grain',
    minAge: 6, allergen: 'wheat', hazard: 'low', ironRich: false,
    nutrition: 'Quick-cooking wheat pasta in tiny form. Whole-wheat versions add fiber.',
    serve: {
      6: 'Cook soft and moisten with olive oil or sauce so it clumps; baby scoops handfuls. Pearl couscous is easier to pick up.',
      9: 'Moist couscous clumps or pearl couscous pieces.',
      12: 'As a side, in salads and bowls.',
    },
  },
  {
    id: 'polenta', name: 'Polenta', emoji: '🌽', category: 'grain',
    minAge: 6, allergen: null, hazard: 'low', ironRich: false,
    nutrition: 'Gluten-free cornmeal comfort food; fortified versions add iron and B vitamins.',
    serve: {
      6: 'Soft warm polenta on a preloaded spoon, or chill until set and cut into soft strips.',
      9: 'Set polenta fingers, lightly pan-warmed, or creamy polenta with spoon practice.',
      12: 'Creamy polenta, polenta fries (baked soft), or under sauces.',
    },
  },
  {
    id: 'buckwheat', name: 'Buckwheat', emoji: '🌾', category: 'grain',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Despite the name, gluten-free and not wheat — a seed with complete protein, iron and magnesium.',
    serve: {
      6: 'Cook groats until very soft into porridge, or make soft buckwheat pancake strips.',
      9: 'Soft kasha (cooked groats) in mixed dishes; pancake pieces.',
      12: 'Buckwheat pancakes, kasha, soba noodles cut up.',
    },
  },
  {
    id: 'tortilla', name: 'Tortilla', emoji: '🫓', category: 'grain',
    minAge: 6, allergen: 'wheat', hazard: 'moderate', ironRich: false,
    hazardNote: 'Dry tortilla can gum into a wad — soften with a moist filling or warm it.',
    nutrition: 'Corn tortillas are naturally gluten-free; flour tortillas count as a wheat exposure. Watch sodium.',
    serve: {
      6: 'Warm a low-sodium tortilla, spread with mashed avocado or hummus, roll tight and slice into pinwheel strips.',
      9: 'Quesadilla strips with melted cheese and mashed beans.',
      12: 'Small soft tacos, quesadilla triangles, pinwheels.',
    },
  },
  // ---------- MORE DAIRY ----------
  {
    id: 'kefir', name: 'Kefir', emoji: '🥛', category: 'dairy',
    minAge: 6, allergen: 'milk', hazard: 'low', ironRich: false,
    nutrition: 'Drinkable yogurt with even more probiotic diversity. Choose plain, whole-milk kefir.',
    serve: {
      6: 'A splash in an open cup with help, stirred into oatmeal, or blended with fruit into a spoonable smoothie.',
      9: 'Open-cup or straw-cup practice with small amounts; smoothie bowls.',
      12: 'Small cups of plain kefir or fruit-blended kefir.',
    },
  },
  {
    id: 'ricotta', name: 'Ricotta', emoji: '🧀', category: 'dairy',
    minAge: 6, allergen: 'milk', hazard: 'low', ironRich: false,
    nutrition: 'Soft, naturally lower-sodium cheese with protein and calcium.',
    serve: {
      6: 'Spread on toast strips, dollop on a preloaded spoon, or fold into scrambled eggs and pasta.',
      9: 'On toast, stirred into pasta, or by the spoonful.',
      12: 'Ricotta pancakes, on toast with fruit, in lasagna.',
    },
  },
  {
    id: 'paneer', name: 'Paneer', emoji: '🧀', category: 'dairy',
    minAge: 6, allergen: 'milk', hazard: 'moderate', ironRich: false,
    hazardNote: 'Firm cubes can be a hazard — serve thin strips or crumbles, cooked soft.',
    nutrition: 'Fresh, unsalted Indian cheese — high protein and naturally low sodium.',
    serve: {
      6: 'Soft-simmered thin strips (curries soften it beautifully), or crumbled into mash.',
      9: 'Crumbled paneer or thin soft-cooked strips.',
      12: 'Cubes simmered soft in mild curries, or thin pan-seared strips.',
    },
  },
  // ---------- MORE LEGUMES ----------
  {
    id: 'white-beans', name: 'White Beans', emoji: '⚪', category: 'legume',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Flatten or mash whole beans for young babies.',
    nutrition: 'Creamy cannellini and navy beans bring iron, protein, calcium and fiber.',
    serve: {
      6: 'Mash low-sodium white beans with olive oil into a spread for toast strips, or fold into vegetable mash.',
      9: 'Flattened whole beans for pincer practice, or white bean dip.',
      12: 'Whole soft beans, in soups and pasta.',
    },
  },
  {
    id: 'kidney-beans', name: 'Kidney Beans', emoji: '🔴', category: 'legume',
    minAge: 6, allergen: null, hazard: 'moderate', ironRich: true,
    hazardNote: 'Flatten or mash for young babies. Always fully cooked (canned is fine) — never undercooked.',
    nutrition: 'Iron, protein and folate with a hearty texture.',
    serve: {
      6: 'Mash well-cooked low-sodium kidney beans into a paste with a little olive oil or avocado.',
      9: 'Flattened beans, or mashed into mild chili.',
      12: 'Whole soft beans, mild chili, rice and beans.',
    },
  },
  {
    id: 'split-peas', name: 'Split Peas', emoji: '🟡', category: 'legume',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Cook down into a naturally smooth, iron-rich porridge — zero prep hazards.',
    serve: {
      6: 'Thick split pea dal or soup on a preloaded spoon, or thick enough to scoop by hand.',
      9: 'Thick split pea stew with spoon practice; spread on toast.',
      12: 'Split pea soup, dal with rice.',
    },
  },
  // ---------- MORE NUTS & SEEDS ----------
  {
    id: 'cashew-butter', name: 'Cashew Butter', emoji: '🌰', category: 'nutseed',
    minAge: 6, allergen: 'treenut', hazard: 'high', ironRich: true,
    hazardNote: 'Same rules as all nut butters: thin it or spread paper-thin. Whole cashews unsafe until age 4+.',
    nutrition: 'A distinct tree-nut exposure from almond — introduce separately. Iron, zinc and magnesium.',
    serve: {
      6: 'Thin smooth cashew butter with warm water into a drizzle for oatmeal or yogurt, or spread paper-thin on toast.',
      9: 'Thin spreads and mix-ins, offered regularly.',
      12: 'Thin spreads, cashew cream in sauces. No whole nuts until 4+.',
    },
  },
  {
    id: 'sunflower-butter', name: 'Sunflower Seed Butter', emoji: '🌻', category: 'nutseed',
    minAge: 6, allergen: null, hazard: 'high', ironRich: true,
    hazardNote: 'Thick seed butters clump like nut butters — always thin or spread paper-thin.',
    nutrition: 'Nut-free spread with vitamin E, iron and healthy fats — great for nut-allergic families.',
    serve: {
      6: 'Thin with warm water and stir into oatmeal, or spread paper-thin on toast strips.',
      9: 'Thin spreads and mix-ins.',
      12: 'Thin spreads, in energy balls and baking.',
    },
  },
  {
    id: 'hemp-seeds', name: 'Hemp Seeds', emoji: '🌿', category: 'nutseed',
    minAge: 6, allergen: null, hazard: 'low', ironRich: true,
    nutrition: 'Soft, tiny hearts with complete protein, iron, and omega-3s — no grinding needed.',
    serve: {
      6: 'Sprinkle over yogurt and oatmeal, or use to add grip to slippery foods like banana and avocado.',
      9: 'A daily sprinkle on almost anything.',
      12: 'Sprinkled on meals, blended into smoothies.',
    },
  },
]

export const AGE_BANDS = [
  { key: 6, label: '6–8 months' },
  { key: 9, label: '9–11 months' },
  { key: 12, label: '12+ months' },
]

export function bandForAgeMonths(months) {
  if (months == null) return null
  if (months < 9) return 6
  if (months < 12) return 9
  return 12
}
