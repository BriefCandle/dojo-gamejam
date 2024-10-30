use core::poseidon::PoseidonTrait;
use core::hash::{HashStateTrait, HashStateExTrait};

#[derive(Drop, Hash)]
struct EntityForHash {
    first: felt252,
    second: u128,
}

#[dojo::interface]
pub trait IEntity {
    fn mintEntity(ref world: IWorldDispatcher, entityType: felt252);
    fn _burnEntity(ref world: IWorldDispatcher, entityId: felt252);
}

#[dojo::contract]
mod entity {
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{Entity, Counter};

    #[abi(embed_v0)]
    impl EntityImpl of IEntity<ContractState> {
        // TODO: make it a private function only be called by other systems
        fn mintEntity(ref world: IWorldDispatcher, entityType: felt252) -> felt252 {
            let count = get!(world, (Counter)).counter + 1;
            let struct_to_hash = EntityForHash { first: entityType, second: count };
            let entityId = PoseidonTrait::new().update_with(struct_to_hash).finalize();
            let entity = Entity {
                entityId: entityId,
                entityType,
                count: count,
            };
            set!(world, (entity));
            return entityId;
        }

        fn _burnEntity(ref world: IWorldDispatcher, entityId: felt252) {
            remove!(world, entityId, (Entity));
        }
    }
}