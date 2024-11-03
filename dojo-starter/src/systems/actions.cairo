use dojo_starter::models::{EntityType, Counter, Hero, HeroSpecs, Battle, DungeonLevelSpecs};
use starknet::{ContractAddress, get_caller_address};

// define the interface
#[dojo::interface]
trait IActions {
    // fn spawn(ref world: IWorldDispatcher);
    // fn initHeroEventMeta(ref world: IWorldDispatcher, heroType: felt252, event: felt252, imageUrl: ByteArray, description: ByteArray);

    fn init(ref world: IWorldDispatcher);

    // init
    fn initHeroSpecs(ref world: IWorldDispatcher , heroType: felt252, attack: u32, defense:u32, maxHealth: u32, maxMana: u32, critChance:u32 );
    fn initDungeonLevel(ref world: IWorldDispatcher, dungeonType: felt252, level: u32,  monsterAmount: u32 , monsterTypes: Array<felt252> );

    fn mintHero(ref world: IWorldDispatcher, heroType: felt252);

    fn enterDungeon(ref world: IWorldDispatcher, dungeonType: felt252,heroIds: Array<felt252>);

    fn changeCovered(ref world: IWorldDispatcher, heroId: felt252);

    fn sharpShoot(ref world: IWorldDispatcher, heroId: felt252, targetId: felt252);

    fn prayNSpray(ref world: IWorldDispatcher, heroId: felt252, targetId: felt252);

    // fn enemyAttack(ref world: IWorldDispatcher, enemyId: felt252, heroId: felt252);

    // fn exitDungeon(ref worldL: IWorldDispatcher, battleId: felt252);
}


// dojo decorator
#[dojo::contract]
mod actions {
    use super::{IActions};
    use dojo_starter::models::{EntityType, Counter, Hero, HeroSpecs, Battle, DungeonLevelSpecs, HeroEventMeta, HeroCovered, AttackEvent};
    use starknet::{ContractAddress, get_caller_address,  get_contract_address};

    use core::poseidon::PoseidonTrait;
    use core::hash::{HashStateTrait, HashStateExTrait};

    #[derive(Copy, Drop, Hash)]
    struct EntityForHash {
        first: felt252,
        second: u128,
    }

            fn mintHero(world: IWorldDispatcher, heroType: felt252, commander: ContractAddress) {
            // let caller = get_caller_address();

            // check heroId exist
            let heroSpecs = get!(world, heroType, (HeroSpecs));
            assert(heroSpecs.maxHealth != 0, 'heorSpecs Not Activated');


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

    

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn sharpShoot(ref world: IWorldDispatcher, heroId: felt252, targetId: felt252) {
            let caller = get_contract_address();
            let hero = get!(world, heroId, Hero);
            // assert(hero.commander == caller, 'caller not commander');

            // assert hero in samge battle with targetId

            let isCovered = get!(world, heroId, HeroCovered).isCovered;
            assert(!isCovered, 'hero is covered');

            let target = get!(world, targetId, Hero);
            let newHealth = if target.health > 10 { target.health - 10 } else { 0 };

            // set!(world, (
            //     Hero {
            //         heroId: targetId,
            //         health: newHealth,
            //     }
            // ))

            emit!(world, AttackEvent {
                heroId,
                targetId,
                prevHealth: target.health,
                currHealth: newHealth,
            })
        }

        fn prayNSpray(ref world: IWorldDispatcher, heroId: felt252, targetId: felt252) {
            let caller = get_contract_address();
            let hero = get!(world, heroId, (Hero));
            // assert(hero.commander == caller, 'caller not commander');

            // assert hero in samge battle with targetId

            let isCovered = get!(world, heroId, HeroCovered).isCovered;
            assert(isCovered, 'hero is not covered');

            let target = get!(world, targetId, (Hero));
            let newHealth = if target.health > 3 { target.health - 3 } else { 0 };
            println!("{}",  target.health);
            println!("{}",  targetId);

            // set!(world, (
            //     Hero {
            //         heroId: targetId,
            //         health: newHealth,
            //     }
            // ))

            emit!(world, AttackEvent {
                heroId,
                targetId,
                prevHealth: target.health,
                currHealth: newHealth,
            })
        }

        fn changeCovered(ref world: IWorldDispatcher, heroId: felt252) {
            let caller = get_contract_address();
            let hero = get!(world, heroId, (Hero));

            println!("{}",  heroId);
            println!("{}",  hero.health);
            println!("{:?}", caller);
            println!("{:?}", hero.commander);
            // assert(hero.commander == caller, 'caller not commander');
            
            // assert hero is in battle

            let mut isCovered = get!(world, heroId, HeroCovered).isCovered;
            set!(world,(HeroCovered {
                heroId,
                isCovered: !isCovered,
            }))

            // no need to emit because HeroCovered is updated
            // emit!(world, HeroCovered {
            //     heroId,
            //     isCovered: !get!(world, heroId, HeroCovered).isCovered,
            // })
        }

        // fn initHeroEventMeta(ref world: IWorldDispatcher, heroType: felt252, event: felt252, imageUrl: ByteArray, description: ByteArray) { 
        //     set!(world, (
        //         HeroEventMeta {
        //             heroType,
        //             event,
        //             imageUrl,
        //             description,
        //         }
        //     ))
        // }


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

        // sozo execute dojo_starter-actions init -c
        fn init(ref world: IWorldDispatcher) {
            // init heroSpecs
            // WHY CANNOT DO IT IN LOOP??????
            let heroSpecs = HeroSpecs {
                    heroType: 'viper'_felt252,
                    attack: 10_u32,
                    defense: 5_u32,
                    maxHealth: 100_u32,
                    maxMana: 100_u32,
                    critChance: 10_u32,
            };
            let heroSpecs2 = HeroSpecs {
                    heroType: 'aria'_felt252,
                    attack: 10_u32,
                    defense: 5_u32,
                    maxHealth: 100_u32,
                    maxMana: 100_u32,
                    critChance: 10_u32,
            };
            

            set!(world, (heroSpecs));
            set!(world, (heroSpecs2));

            // mintHero(world, heroSpecs.heroType, get_contract_address());
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
        fn mintHero(ref world: IWorldDispatcher, heroType: felt252) {
            let caller = get_caller_address();

            mintHero(world, heroType, caller);
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
