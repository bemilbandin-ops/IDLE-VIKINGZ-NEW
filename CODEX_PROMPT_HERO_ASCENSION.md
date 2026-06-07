Implement hero ascension using hero shards.

Requirements:
- Heroes start at Common.
- Heroes can ascend in this order: Common -> Rare -> Epic -> Legendary -> Einherjar.
- Shard costs per upgrade are: 20, 40, 60, 100.
- Hero shards are hero-specific: Astrid shards ascend Astrid, Hilda shards ascend Hilda, Bjorn shards ascend Bjorn.
- Award hero shards on first-time level completion.
- Award hero shards as a rare random drop when a level ends in victory.
- Save shards, ascension tiers, and first-time completion reward status in localStorage.
- Show each hero's rarity, shard count, next ascension cost, and Ascend button in the hero upgrade screen.
- Disable Ascend when the hero is already Einherjar or lacks enough shards.
- Ascension should improve hero combat stats so the upgrade is meaningful.
- Victory screen should clearly list first-clear shard rewards and rare random shard drops.
