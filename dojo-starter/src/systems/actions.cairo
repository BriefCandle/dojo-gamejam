use dojo_starter::models::{Entity, Counter, Hero, HeroSpecs, Battle, DungeonLevelSpecs};

// define the interface
#[dojo::interface]
trait IActions {
    // fn spawn(ref world: IWorldDispatcher);

    // init
    fn generateHeroSpecs(ref world: IWorldDispatcher , heroType: felt252, attack: u32, defense:u32, maxHealth: u32, maxMana: u32, critChance:u32 );
    fn generateDungeonLevel(ref world: IWorldDispatcher, dungeonType: felt252, level: u32,  monsterAmount: u32 );
}


// dojo decorator
#[dojo::contract]
mod actions {
    use super::{IActions};
    use dojo_starter::models::{Entity, Counter, Hero, HeroSpecs, Battle, DungeonLevelSpecs};
    use starknet::{ContractAddress, get_caller_address};

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {

        // sozo execute dojo_starter-actions generateHeroSpecs -c 0x12121221,1,1,1,1,1
        fn generateHeroSpecs(ref world: IWorldDispatcher, heroType: felt252, attack: u32, defense:u32, maxHealth: u32, maxMana: u32, critChance:u32) {
            // TODO: only owner can call
            set!(world, (
                HeroSpecs {
                    heroType,
                    attack,
                    defense,
                    maxHealth,
                    maxMana,
                    critChance
                }
            ))
        }

        // sozo execute dojo_starter-actions generateDungeonLevel -c 0x12121221,1,1,[0x1212,0x1212]
        fn generateDungeonLevel(ref world: IWorldDispatcher, dungeonType: felt252, level: u32,  monsterAmount: u32) {
            // TODO: only owner can call
            set!(world, (
                DungeonLevelSpecs {
                    dungeonType,
                    level,
                    monsterAmount,
                    monsterTypes: array![]
                }
            ))
        }
    }
}
