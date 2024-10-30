use dojo_starter::models::{EntityType, Counter, Hero, HeroSpecs, Battle, DungeonLevelSpecs};
use starknet::{ContractAddress, get_caller_address};

// define the interface
#[dojo::interface]
trait IActions {
    // fn spawn(ref world: IWorldDispatcher);

    // init
    fn initHeroSpecs(ref world: IWorldDispatcher , heroType: felt252, attack: u32, defense:u32, maxHealth: u32, maxMana: u32, critChance:u32 );
    fn initDungeonLevel(ref world: IWorldDispatcher, dungeonType: felt252, level: u32,  monsterAmount: u32 , monsterTypes: Array<felt252> );

    fn mintHero(ref world: IWorldDispatcher, heroType: felt252, commander: ContractAddress);

    fn enterDungeon(ref world: IWorldDispatcher, dungeonType: felt252,heroIds: Array<felt252>);

    // fn exitDungeon(ref worldL: IWorldDispatcher, battleId: felt252);
}


// dojo decorator
#[dojo::contract]
mod actions {
    use super::{IActions};
    use dojo_starter::models::{EntityType, Counter, Hero, HeroSpecs, Battle, DungeonLevelSpecs};
    use starknet::{ContractAddress, get_caller_address,  get_contract_address};

    use core::poseidon::PoseidonTrait;
    use core::hash::{HashStateTrait, HashStateExTrait};

    #[derive(Copy, Drop, Hash)]
    struct EntityForHash {
        first: felt252,
        second: u128,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {

        // sozo execute dojo_starter-actions initHeroSpecs -c 0x12121221,1,1,1,1,1
        fn initHeroSpecs(ref world: IWorldDispatcher, heroType: felt252, attack: u32, defense:u32, maxHealth: u32, maxMana: u32, critChance:u32) {
            // TODO: only owner can call
            set!(world, (
                HeroSpecs {
                    heroType,
                    attack,
                    defense,
                    maxHealth,
                    maxMana,
                    critChance,
                }
            ))
        }

        // sozo execute dojo_starter-actions initDungeonLevel -c 0x12121221,1,1,0x1,0x4
        fn initDungeonLevel(ref world: IWorldDispatcher, dungeonType: felt252, level: u32,  monsterAmount: u32, monsterTypes: Array<felt252>) {
            // TODO: only owner can call
            set!(world, (
                DungeonLevelSpecs {
                    dungeonType,
                    level,
                    monsterAmount,
                    monsterTypes,
                }
            ))
        }

        // sozo execute dojo_starter-actions mintHero -c 0x12121221,0x111
        fn mintHero(ref world: IWorldDispatcher, heroType: felt252, commander: ContractAddress) {
            // let caller = get_caller_address();

            // check heroId exist
            let heroSpecs = get!(world, heroType, (HeroSpecs));
            assert(heroSpecs.maxHealth != 0, 'Not Actived');


            ///////// _mintEntityType
            let mut counter = get!(world, heroType , Counter);
            let currCount = counter.count;
            counter.count += 1;

            let struct_to_hash = EntityForHash { first: heroType, second: currCount };
            let entityId = PoseidonTrait::new().update_with(struct_to_hash).finalize();

            let et = EntityType {
                entityId,
                entityType: heroType,
                count: currCount,
            };

            set!(world, (counter, et));
            /////////


            set!(world, (
                Hero {
                    heroId: entityId,
                    commander,
                    exp: 0,

                    battleId: 0x0,
                    currRound: 0,

                    health: heroSpecs.maxHealth,
                    mana: heroSpecs.maxMana,
                }
            ))
        }


        fn enterDungeon(ref world: IWorldDispatcher, dungeonType: felt252,heroIds: Array<felt252>) {

            let caller = get_contract_address();
            // check dungeon

            // loop heroIds check owned by caller

            let dungeonLevelSpecs = get!(world, dungeonType, DungeonLevelSpecs);

            assert(dungeonLevelSpecs.level == 1, 'xxx');

            let mut i = 0;
            loop {
                if heroIds.len() == i {
                    break();
                }
                let heroId = *heroIds.at(i);

                let hero = get!(world, heroId, Hero);
                assert(hero.commander == caller, 'caller not commander');
                // assert(hero)
                i += 1;
            }
            
        }

    // fn exitDungeon(ref worldL: IWorldDispatcher, battleId: felt252);
    }

    // #[generate_trait]
    // impl InternalFunctions of InternalFunctionsTrait {

    //     fn _mintEntityType(ref world: IWorldDispatcher, entityType: felt252) -> felt252 {

    //         let mut counter = get!(world, entityType , Counter);
    //         let currCount = counter.count;
    //         counter.count += 1;

    //         let struct_to_hash = EntityForHash { first: entityType, second: currCount };
    //         let entityId = PoseidonTrait::new().update_with(struct_to_hash).finalize();

    //         let et = EntityType {
    //             entityId,
    //             entityType,
    //             count: currCount,
    //         };

    //         set!(world, (counter, et));

    //         entityId
    //     }
    // }
}
