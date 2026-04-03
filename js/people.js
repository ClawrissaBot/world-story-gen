// === People & Character Generation ===

const FIRST_NAMES_M = ['Arn','Bran','Cael','Dorn','Egan','Finn','Gael','Holt','Ivar','Jorn','Kael','Leif','Mael','Norn','Orin','Penn','Quinn','Rael','Sven','Thane','Ulf','Vorn','Wren','Yorick','Zael','Ash','Bael','Cole','Drake','Edan','Flint','Gareth','Hugo','Idris','Jasper','Knox','Liam','Magnus','Nyx','Odin','Pike','Reed','Storm','Troy','Uri','Vale','Wolf','Xander','Yael','Zeke'];
const FIRST_NAMES_F = ['Anya','Bria','Cora','Dara','Elin','Faye','Gwen','Hila','Iris','Juna','Kira','Luna','Mira','Neve','Ora','Peri','Quinn','Ren','Sage','Thea','Uma','Vera','Wynn','Xyla','Yara','Zara','Aela','Bryn','Cass','Della','Ember','Freya','Gaia','Hana','Ivy','Jade','Kova','Lina','Maren','Nyla','Opal','Penna','Rhea','Sola','Tavi','Ulia','Veda','Wren','Xena','Yuna'];
const SURNAMES = ['Stone','River','Hill','Brook','Field','Wood','Iron','Frost','Flame','Storm','Thorn','Wolf','Hawk','Bear','Fox','Oak','Pine','Marsh','Glen','Dale','Forge','Mill','Smith','Fisher','Hunter','Baker','Weaver','Thatcher','Cooper','Mason','Fletcher','Tanner','Carter','Porter','Archer','Farmer','Potter','Brewer','Chandler','Dyer'];

const ROLES = {
  // Stone Age
  gatherer:     { name: 'Gatherer',     emoji: '🌿', minAge: 0, maxAge: 2, skills: ['foraging','herbalism'] },
  hunter:       { name: 'Hunter',       emoji: '🏹', minAge: 0, maxAge: 4, skills: ['tracking','combat'] },
  elder:        { name: 'Elder',        emoji: '👴', minAge: 0, maxAge: 8, skills: ['wisdom','leadership'] },
  healer:       { name: 'Healer',       emoji: '💚', minAge: 0, maxAge: 8, skills: ['medicine','herbalism'] },
  // Bronze/Iron Age
  farmer:       { name: 'Farmer',       emoji: '🌾', minAge: 1, maxAge: 8, skills: ['agriculture','husbandry'] },
  miner:        { name: 'Miner',        emoji: '⛏️', minAge: 1, maxAge: 8, skills: ['mining','endurance'] },
  smith:        { name: 'Smith',        emoji: '🔨', minAge: 1, maxAge: 8, skills: ['metalwork','crafting'] },
  warrior:      { name: 'Warrior',      emoji: '⚔️', minAge: 1, maxAge: 8, skills: ['combat','tactics'] },
  trader:       { name: 'Trader',       emoji: '🤝', minAge: 1, maxAge: 8, skills: ['bartering','diplomacy'] },
  builder:      { name: 'Builder',      emoji: '🏗️', minAge: 1, maxAge: 8, skills: ['construction','planning'] },
  // Classical+
  priest:       { name: 'Priest',       emoji: '🙏', minAge: 3, maxAge: 8, skills: ['religion','leadership'] },
  scholar:      { name: 'Scholar',      emoji: '📚', minAge: 3, maxAge: 8, skills: ['research','writing'] },
  governor:     { name: 'Governor',     emoji: '🏛️', minAge: 3, maxAge: 8, skills: ['administration','diplomacy'] },
  artisan:      { name: 'Artisan',      emoji: '🎨', minAge: 2, maxAge: 8, skills: ['crafting','creativity'] },
  sailor:       { name: 'Sailor',       emoji: '⛵', minAge: 4, maxAge: 8, skills: ['navigation','exploration'] },
  // Industrial+
  engineer:     { name: 'Engineer',     emoji: '⚙️', minAge: 6, maxAge: 8, skills: ['engineering','innovation'] },
  merchant:     { name: 'Merchant',     emoji: '💰', minAge: 4, maxAge: 8, skills: ['commerce','logistics'] },
  diplomat:     { name: 'Diplomat',     emoji: '🕊️', minAge: 5, maxAge: 8, skills: ['diplomacy','espionage'] },
  scientist:    { name: 'Scientist',    emoji: '🔬', minAge: 7, maxAge: 8, skills: ['research','innovation'] },
};

let _personId = 0;

function generatePerson(ageIndex, settlementName) {
  const isMale = Math.random() < 0.5;
  const firstName = isMale
    ? FIRST_NAMES_M[Math.floor(Math.random() * FIRST_NAMES_M.length)]
    : FIRST_NAMES_F[Math.floor(Math.random() * FIRST_NAMES_F.length)];
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  
  // Assign a role appropriate for the age
  const availableRoles = Object.entries(ROLES).filter(([_, r]) => ageIndex >= r.minAge && ageIndex <= r.maxAge);
  const [roleKey, role] = availableRoles[Math.floor(Math.random() * availableRoles.length)];
  
  return {
    id: ++_personId,
    name: `${firstName} ${surname}`,
    firstName,
    surname,
    male: isMale,
    age: 16 + Math.floor(Math.random() * 40),
    roleKey,
    role: role.name,
    roleEmoji: role.emoji,
    skills: [...role.skills],
    skillLevel: Math.floor(Math.random() * 3) + 1, // 1-3
    health: 80 + Math.floor(Math.random() * 21),
    morale: 60 + Math.floor(Math.random() * 41),
    settlement: settlementName,
    notable: false,
    deeds: [],
    alive: true,
    bornTurn: 0,
  };
}

function assignNeededRole(person, neededRole, ageIndex) {
  const role = ROLES[neededRole];
  if (!role || ageIndex < role.minAge) return false;
  person.roleKey = neededRole;
  person.role = role.name;
  person.roleEmoji = role.emoji;
  person.skills = [...new Set([...person.skills, ...role.skills])];
  return true;
}

function getRolesForAge(ageIndex) {
  return Object.entries(ROLES)
    .filter(([_, r]) => ageIndex >= r.minAge && ageIndex <= r.maxAge)
    .map(([key, r]) => ({ key, ...r }));
}

// Generate a notable deed for a character
function generateDeed(person, turn, type) {
  const deeds = {
    discovery: [
      `discovered a new ${['herb','mineral','technique','path'][Math.floor(Math.random()*4)]}`,
      `mapped uncharted territory nearby`,
      `invented a new ${person.skills[0]} method`,
    ],
    heroic: [
      `defended the village from raiders`,
      `saved a family from a wildfire`,
      `led a daring expedition`,
      `negotiated peace between rival factions`,
    ],
    cultural: [
      `composed a song that became legendary`,
      `built a monument that inspired the people`,
      `established a new tradition`,
      `wrote the settlement's first chronicle`,
    ],
    tragic: [
      `was lost exploring the wilderness`,
      `fell in battle defending the settlement`,
      `succumbed to a mysterious illness`,
    ],
  };
  
  const pool = deeds[type] || deeds.discovery;
  const deed = pool[Math.floor(Math.random() * pool.length)];
  person.deeds.push({ turn, text: deed });
  person.notable = true;
  return `${person.roleEmoji} ${person.name} ${deed}`;
}
