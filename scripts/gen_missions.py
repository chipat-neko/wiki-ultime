"""
Generate SAMPLE_MISSIONS entries from SCMDB 4.6 data.
Run: python3 scripts/gen_missions.py > /tmp/new_missions.txt
"""
import json, urllib.request, re
from collections import defaultdict

data = json.load(open('C:/Users/Noah/AppData/Local/Temp/scmdb_46.json', encoding='utf-8'))
contracts = data['contracts']
legacy = data['legacyContracts']
factions = data['factions']

SUPABASE_URL = "https://gqfsmlwaeklemieayaxg.supabase.co"
ANON_KEY = "sb_publishable_9qnZqZHNETujV1BXsguTQA_oucbX-cc"

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/overrides?limit=1000",
    headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"}
)
with urllib.request.urlopen(req, timeout=10) as resp:
    overrides = json.loads(resp.read())

override_map = defaultdict(dict)
for o in overrides:
    override_map[o['contract_id']][o['field']] = o['value']

faction_map = {guid: f.get('name', '?') for guid, f in factions.items()}

type_uec = defaultdict(list)
for c in contracts:
    if c['id'] in override_map and 'rewardUEC' in override_map[c['id']]:
        type_uec[c['missionType']].append(override_map[c['id']]['rewardUEC'])
for c in legacy:
    if c.get('rewardUEC'):
        type_uec[c.get('missionType', 'Hauling')].append(c['rewardUEC'])

type_avg = {t: int(sum(v) / len(v)) for t, v in type_uec.items()}


def get_uec(c):
    cid = c['id']
    if cid in override_map and 'rewardUEC' in override_map[cid]:
        return override_map[cid]['rewardUEC']
    if c.get('rewardUEC'):
        return c['rewardUEC']
    mt = c.get('missionType', '?')
    diff_score = c.get('difficulty', {}).get('score', 3) if isinstance(c.get('difficulty'), dict) else 3
    base = type_avg.get(mt, 30000)
    return max(5000, int(base * (diff_score / 3.5)))


def get_difficulty(score):
    if score <= 2:
        return 'Facile'
    if score <= 3.5:
        return 'Moyen'
    if score <= 5:
        return 'Difficile'
    return 'Extreme'


def map_type_id(mt, c):
    illegal = c.get('illegal', False)
    mapping = {
        'Delivery': 'delivery-illegal' if illegal else 'delivery-standard',
        'Mercenary': 'pirate-clearing' if not illegal else 'bounty-illegal',
        'Bounty Hunter': 'bounty-illegal' if illegal else 'bounty-lawful',
        'Priority': 'delivery-priority',
        'Ship Mining': 'mining-mission',
        'Salvage': 'salvage-mission',
        'Investigation': 'investigation',
        'Collection': 'survey-mission',
        'Ground Vehicle Mining': 'surface-mining',
        'Hand Mining': 'surface-mining',
        'Hauling - Interstellar': 'cargo-bulk',
        'Hauling - Stellar': 'cargo-hauling',
        'Hauling - Planetary': 'cargo-hauling',
        'Hauling - Local': 'delivery-standard',
        'Hauling': 'cargo-hauling',
        'Maintenance': 'repair-mission',
        'PvP Missions': 'piracy' if illegal else 'patrol-escort',
        'Wikelo - Vehicles': 'cargo-run-pyro',
        'Wikelo - Other Items': 'survey-mission',
    }
    return mapping.get(mt, 'delivery-standard')


FACTION_MAP = {
    'crusader': 'crusader',
    'arccorp': 'arccorp',
    'microtech': 'microtech',
    'shubin': 'shubin',
    'covalex': 'covalex',
    'rayari': 'rayari',
    'nine tails': 'nine-tails',
    'bounty hunters': 'uee',
    'hurston': 'arccorp',
    'grim hex': 'criminal',
    'headhunters': 'criminal',
    'misc': 'misc',
    'tar pits': 'criminal',
    'vaughn': 'criminal',
    'foxwell': 'uee',
    'advocacy': 'uee',
    'wikelo': 'misc',
    'peoples': 'uee',
    'adagio': 'criminal',
    'cfp': 'uee',
}


def map_faction(name):
    nl = name.lower()
    for key, val in FACTION_MAP.items():
        if key in nl:
            return val
    return 'uee'


def map_location(c):
    prereqs = c.get('prerequisites', {})
    if isinstance(prereqs, dict):
        locs = prereqs.get('location', [])
        if locs and isinstance(locs, list) and locs[0].get('name'):
            return locs[0]['name'].lower().replace(' ', '-')
    systems = c.get('systems', ['Stanton'])
    if 'Pyro' in systems:
        return 'pyro'
    if 'Nyx' in systems:
        return 'nyx'
    return 'stanton'


def clean_text(s):
    if not s:
        return ''
    s = re.sub(r'\[.*?\]', '', s)
    s = re.sub(r'</?EM\d?>', '', s)  # remove all EM tags including empty ones
    s = s.replace("'", '`').replace('"', '`').replace('\\n', ' ').replace('\n', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def get_giver(c):
    fn = faction_map.get(c.get('factionGuid', ''), '')
    if fn and fn != '?':
        return clean_text(fn)
    mt = c.get('missionType', '')
    defaults = {
        'Bounty Hunter': 'Bounty Hunters Guild',
        'Priority': 'Priority Mission Terminal',
        'Investigation': 'Advocacy Bureau',
        'Maintenance': 'Station Operations',
        'Ship Mining': 'Mining Contract Terminal',
        'Salvage': 'Salvage Contract Board',
    }
    return defaults.get(mt, 'Mission Terminal')


# Select missions
type_limits = {
    'Delivery': 8, 'Mercenary': 10, 'Bounty Hunter': 8, 'Priority': 6,
    'Ship Mining': 6, 'Salvage': 6, 'Investigation': 5, 'Collection': 5,
    'Ground Vehicle Mining': 4, 'Hand Mining': 4, 'Hauling - Interstellar': 4,
    'Hauling - Stellar': 4, 'Hauling - Planetary': 3, 'Hauling - Local': 3,
    'Hauling': 3, 'Maintenance': 3, 'PvP Missions': 2,
    'Wikelo - Vehicles': 3, 'Wikelo - Other Items': 2,
}

all_c = contracts + legacy
all_c_sorted = sorted(all_c, key=lambda c: (
    -int(c['id'] in override_map or bool(c.get('rewardUEC'))),
    -(c.get('difficulty', {}).get('score', 0) if isinstance(c.get('difficulty'), dict) else 0)
))

seen_types = defaultdict(int)
used_ids = set()
selected = []

for c in all_c_sorted:
    mt = c.get('missionType', '?')
    limit = type_limits.get(mt, 3)
    if seen_types[mt] >= limit:
        continue
    if c['id'] in used_ids:
        continue
    uec = get_uec(c)
    if uec < 5000:
        continue
    diff_obj = c.get('difficulty', {})
    diff_score = diff_obj.get('score', 3) if isinstance(diff_obj, dict) else 3
    time_val = c.get('timeToComplete') or 15
    # Skip unrealistically long missions
    if time_val > 150:
        continue
    selected.append((c, uec, diff_score, time_val))
    seen_types[mt] += 1
    used_ids.add(c['id'])

# Output JS
print("  // ─── MISSIONS SCMDB 4.6 LIVE ─────────────────────────────────")
start_id = 123

for i, (c, uec, diff_score, time_val) in enumerate(selected):
    mid = start_id + i
    mt = c.get('missionType', '?')
    type_id = map_type_id(mt, c)
    fn = faction_map.get(c.get('factionGuid', ''), 'Anonyme')
    faction_id = map_faction(fn)
    legal = not c.get('illegal', False)
    systems = c.get('systems', ['Stanton'])
    location = map_location(c)
    diff_label = get_difficulty(diff_score)
    time_int = max(5, round(time_val))
    title = clean_text(c.get('title', c.get('debugName', 'Mission')))
    if not title:
        title = c.get('debugName', 'Mission Contract')
    # Enrich generic names with cargo or system info
    hauling_for_name = c.get('haulingOrders') or []
    if hauling_for_name and isinstance(hauling_for_name, list):
        h0 = hauling_for_name[0]
        res0 = h0.get('resource', {}) if isinstance(h0, dict) else {}
        if res0 and res0.get('name'):
            cargo_name = clean_text(res0['name'])[:40]
            if title in ('Need Resource for Research', 'Vital Resources Needed For Research',
                         'Obtain Irradiated Valakkar Pearls', 'Med. Purchase Order: Ship Mined Ore',
                         'Small Purchase Order: Vehicle Mined Ore', 'Med. Purchase Order: Vehicle Mined Ore'):
                title = f"{title}: {cargo_name}"
    giver = get_giver(c)
    hauling = c.get('haulingOrders') or []
    cargo = None
    if hauling and isinstance(hauling, list):
        h = hauling[0]
        res = h.get('resource', {}) if isinstance(h, dict) else {}
        if res:
            cargo = clean_text(res.get('name', ''))
    desc = clean_text(c.get('description', ''))[:160]
    if not desc:
        if cargo:
            desc = f"Contrat {mt}. Ressource : {cargo}."
        else:
            desc = f"Contrat {mt} - {', '.join(systems)}."
    expire_h = 6 if not legal else (72 if diff_label == 'Extreme' else (48 if diff_label == 'Difficile' else 24))
    diff_out = 'Extr\u00eame' if diff_label == 'Extreme' else diff_label
    print(
        f"  {{ id: 'mission-{mid:03d}', typeId: '{type_id}', "
        f"name: '{title[:80]}', "
        f"description: '{desc[:150]}', "
        f"location: '{location}', faction: '{faction_id}', "
        f"payout: {uec}, difficulty: '{diff_out}', timeLimit: null, "
        f"legal: {'true' if legal else 'false'}, estimatedTime: {time_int}, "
        f"giver: '{giver}', expires: Date.now() + {expire_h} * 60 * 60 * 1000 }},"
    )

print(f"\n// Total: {len(selected)} missions generated from SCMDB 4.6 live data", file=__import__('sys').stderr)
