use dojo_starter::models::Entity;
use dojo_starter::models::Counter;
use dojo_starter::models::Hero;
use dojo_starter::models::HeroSpecs;

#[dojo::interface]
pub trait IHero {
    fn mintHero(ref world: IWorldDispatcher, heroType: felt252, commander: ContractAddress);
    fn _burnHero(ref world: IWorldDispatcher, heroId: felt252);
    fn initHeroType(ref world: IWorldDispatcher, heroType: felt252, attack: u32, defense: u32, maxHealth: u32, maxMana: u32, critChance: u32, skillTypes: Array<felt252>);
}

#[dojo::contract]
mod hero {
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{Hero, HeroSpecs, HeroBattle};

    #[abi(embed_v0)]
    impl HeroImpl of IHero<ContractState> { 
        fn mintHero(ref world: IWorldDispatcher, heroType: felt252, commander: ContractAddress) -> felt252 {
            let commander = get_caller_address();
            // call mintEntity from entity module
            let heroId = mintEntity!(world, (Entity), heroType);
            set!(world, (Hero { heroId, commander, exp: 0 }));
            set!(world, (Health { heroId, hp: HeroSpecs.get(heroType).maxHp }));
            set!(world, (Mana { heroId, mp: HeroSpecs.get(heroType).maxMp }));
            return heroId;
        }

        fn initHeroType(ref world: IWorldDispatcher, heroType: felt252, attack: u32, defense: u32, maxHealth: u32, maxMana: u32, critChance: u32, skillTypes: Array<felt252>) {
            set!(world, (HeroSpecs { heroType, attack, defense, maxHealth, maxMana, critChance, skillTypes }));
        }

        fn _burnHero(ref world: IWorldDispatcher, heroId: felt252) {
            remove!(world, heroId, (Hero));
            remove!(world, heroId, (Health));
            remove!(world, heroId, (Mana));
            // note: also burn hero's battle instance
            remove!(world, heroId, (HeroBattle));
            _burnEntity(world, heroId);
        }
    }}