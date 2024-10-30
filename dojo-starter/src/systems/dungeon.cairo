
#[dojo::interface]
pub trait IDungon{
    fn enterDungeon(ref world: IWorldDispatcher, dungeonType: felt252, heroIds: Array<felt252>);
    fn _spawnDungeonLevel(ref world: IWorldDispatcher, dungeonType: felt252, level: u32);
    fn _spawnMonsters(ref world: IWorldDispatcher, monsterIds: Array<felt252>);
    fn exitDungeon(ref world: IWorldDispatcher, battleId: felt252);
    // fn nextRound(ref world: IWorldDispatcher, battleId: felt252);
    // fn attack(ref world: IWorldDispatcher, heroId: felt252, targetId: felt252);
    // fn skill(ref world: IWorldDispatcher, heroId: felt252, skillId: felt252, targetId: felt252);
}

#[dojo::contract]
mod dungeon {
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{Hero, HeroSpecs, HeroBattle, DungeonLevelSpecs};

    #[abi(embed_v0)]
    impl DungeonImpl of IDungeon<ContractState> {
        // TOO MUCH GAS??
        fn enterDungeon(ref world: IWorldDispatcher, dungeonType: felt252,heroIds: Array<felt252>) { 
            assert!(heroIds.len() > 0, "NotMinHero");
            assert!(heroIds.len() <= 3, "maxHeroesReached");
            let commander = get_caller_address();
            for heroId in heroIds.span() {
                let battleId = get!(world, heroId, (HeroBattle)).battleId;
                assert!(battleId == 0, "heroInBattle");
                let commander = get!(world, heroId, (Hero)).commander;
                assert!(commander == commander, "heroNotYours");
            }
            // setting Battle instance & HeroBattle instance
            let battleId = mintEntity!(world, singlefelt252::<BATTLE>);
            set!(world, (Battle { battleId, currRound: 1, heroIds }));
            for heroId in heroIds.span() {
                set!(world, (HeroBattle { heroId, battleId, currRound: 1 }));
            }

            _spawnDungeonLevel(world, dungeonType, 1);

        }

        // PRIVATE: spawn a dungeon level
        fn _spawnDungeonLevel(ref world: IWorldDispatcher,  battleId: felt52, dungeonType: felt252, level: u32) {
            let monsterTypes = get!(world, dungeonType,level, (DungeonLevelSpecs)).monsterTypes;
            // TODO: randomly draw monsters of monsterAmount from monsterTypes
            _spawnMonsters(world, battleId, monsterTypes);
        }

        // PRIVATE: spawn monsterTypes into a battle
        fn _spawnMonsters(ref world: IWorldDispatcher, battleId: felt52, monsterTypes: Array<felt252>) -> Array<felt252> {
            let commander = singlecontractaddress::<DUNGEON>;
            for monsterType in monsterTypes.span() {
                let monsterId = mint_hero(world, monsterType, commander);
                for heroId in heroIds.span() {
                    set!(world, (HeroBattle { monsterId, battleId, currRound: 1 }));
                }
            }
        }

        // exit dungeon when all heroes in battle is commanded by you
        fn exitDungeon(ref world: IWorldDispatcher, battleId: felt252) {
            let commander = get_caller_address();
            let heroIds = get!(world, battleId, (Battle)).heroIds;
            // assert conditions
            for heroId in heroIds.span() {
                let heroBattle = get!(world, heroId, (HeroBattle));
                assert!(heroBattle.battleId == battleId, "heroNotInBattle");
                let hero = get!(world, heroId, (Hero)).commander;
                assert!(hero.commander == commander, "heroNotYours");
            }
            // remove hero battle instance
            for heroId in heroIds.span() {
                remove!(world, heroId, (HeroBattle));
            }
            // remove battle instance
            remove!(world, battleId, (Battle));
        }
    }
}
