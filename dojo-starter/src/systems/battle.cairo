#[dojo::interface]
pub trait IBattle{
    fn mockWinBattle(ref world: IWorldDispatcher, battleId: felt252);
    // fn mockDefeatBattle(ref world: IWorldDispatcher, battleId: felt252);
}

#[dojo::contract]
mod battle {
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{HeroBattle, Hero};

    #[abi(embed_v0)]
    impl mockWinBattle of IBattle<ContractState> {
        // burn all heroes in battle if they are from dungeon
        fn mockWinBattle(ref world: IWorldDispatcher, battleId: felt252) {
            let commander = singlecontractaddress::<DUNGEON>;
            for heroId in heroIds.span() {
                let isFromDungeon = get!(world, heroId, (Hero)).commander == commander;
                if (isFromDungeon) {
                    _burnHero(world, heroId);
                }
            }
        }
    }
}