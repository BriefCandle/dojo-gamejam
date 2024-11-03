use starknet::{ContractAddress, contract_address_const};

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Moves {
    #[key]
    pub player: ContractAddress,
    pub remaining: u8,
    pub last_direction: Direction,
    pub can_move: bool,
}

#[derive(Drop, Serde)]
#[dojo::model]
pub struct DirectionsAvailable {
    #[key]
    pub player: ContractAddress,
    pub directions: Array<Direction>,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Position {
    #[key]
    pub player: ContractAddress,
    pub vec: Vec2,
}


#[derive(Serde, Copy, Drop, Introspect)]
pub enum Direction {
    None,
    Left,
    Right,
    Up,
    Down,
}


#[derive(Copy, Drop, Serde, Introspect)]
pub struct Vec2 {
    pub x: u32,
    pub y: u32
}


impl DirectionIntoFelt252 of Into<Direction, felt252> {
    fn into(self: Direction) -> felt252 {
        match self {
            Direction::None => 0,
            Direction::Left => 1,
            Direction::Right => 2,
            Direction::Up => 3,
            Direction::Down => 4,
        }
    }
}


#[generate_trait]
impl Vec2Impl of Vec2Trait {
    fn is_zero(self: Vec2) -> bool {
        if self.x - self.y == 0 {
            return true;
        }
        false
    }

    fn is_equal(self: Vec2, b: Vec2) -> bool {
        self.x == b.x && self.y == b.y
    }
}

#[cfg(test)]
mod tests {
    use super::{Position, Vec2, Vec2Trait};

    #[test]
    fn test_vec_is_zero() {
        assert(Vec2Trait::is_zero(Vec2 { x: 0, y: 0 }), 'not zero');
    }

    #[test]
    fn test_vec_is_equal() {
        let position = Vec2 { x: 420, y: 0 };
        assert(position.is_equal(Vec2 { x: 420, y: 0 }), 'not equal');
    }
}
// modifier
//  - AccessControl: isCommander
//  - BattleControl: sameBattle, notInBattle

// 1） 初始化英雄，初始化地牢，mint英雄，进入地牢，退出地牢等system
// initHeroType(heroType, HeroSpecs): 
// initDungeonType(dungeonType, level, DungeonSpecs)
// mintHero(heroType)
// enterDungeon(heroIds, dungeonType)
// mockWinBattle(battleId) -> 
// mockDefeatBattle(battleId) ->
// exitDungeon(battleId) -> 



// _mint(entityType) function for entity: accumulate counter for entityType and add entityType
// mintHero(heroType): mint(), init Hero without setting HeroBattle

// enterDungeon(heroIds, dungeonType): 
//  --- isCommander for ALL heroIds
//  --- "maxHeroesReached": require heroIds.length <= 4
//  --- "heroInBattle", require ALL heroes NOT in battle, i.e., HeroBattle's battleId != 0
//  --- felt252 battleId = mint(felt252("BATTLE")) 
//  --- Battle.set(battleId, currRound: 1, heroIds: heroIds)
//  --- HeroBattle.set(heroId, battleId: battleId, currRound: 1)
//  --- _mintDungeonHero(dungeonType, level, battleId) ...

// mockWinBattle(battleId):
// --- isDungeonCommander for ALL heroIds = Battle.get(battleId).heroIds == DUNGEON_COMMANDER
// --- _burnDungeonHero(heroId): 

// exitDungeon(battleId):
// --- isCommander for ALL heroIds = Battle.get(battleId).heroIds
// --- Battle.delete(battleId)
// --- HeroBattle.delete(heroId) for heroId in heroIds

// leaveBattle(heroId):
//  --- check hero.battleId != 0; else revert
//  --- 如果还有地牢英雄，并且没有执行action, revert
//  --- _burnHero(heroId), 


// #[derive(Serde, Copy, Drop, Introspect)]
// pub enum Action {
//     None,
//     Attack,
//     Defend,
//     Skill,
//     Recruit,
//     Use,
//     Flee,
// }

// const COMMANDER_MONSTER : ContractAddress = contract_address_const::<'xxxx'>();

// ---- entity----
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct EntityType {
    #[key]
    pub entityId: felt252,
    pub entityType: felt252,
    pub count: u128,
}
// useEntityQuery([HasValue(Hero, {commander: account.address})]).map((entity)=> getComponetValue(Hero, entity)?.heroId)
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Counter {
    #[key]
    pub entityType: felt252,
    pub count: u128,
}

// 记录一个英雄instance的信息，包括指挥官，经验值等，不包括MP, HP
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Hero {
    #[key]
    pub heroId: felt252, // 类似nftid
    pub commander: ContractAddress,  // maybe no one
    pub exp: u32,

    // battle info
    pub battleId: felt252, 
    pub currRound: u128,

    pub health: u32, // hp
    pub mana: u32,   // mp
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct HeroCovered {
    #[key]
    pub heroId: felt252, 
    pub isCovered: bool,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
#[dojo::event]
pub struct AttackEvent {
    #[key]
    pub heroId: felt252,
    // future, can do targetIds: Array<felt252>
    pub targetId: felt252,
    pub prevHealth: u32,
    pub currHealth: u32,
}



// 记录一个英雄instance有关battle的信息，包括所处battleId，当前round，
// #[derive(Copy, Drop, Serde)]
// #[dojo::model]
// pub struct HeroBattle {
//     #[key]
//     pub heroId: felt252,
//     pub battleId: felt252,
//     pub currRound: u128,
// }

// 记录一个英雄class的信息，包括攻击力，防御力，最大生命值，最大法力值，暴击率等
// ex., heroId -> heroType = EntityType.get(heroId) -> HeroSpecs.get(heroType)
// init: heroType -> HeroSpecs
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct HeroSpecs {
    #[key]
    pub heroType: felt252,  // 类似nft contract address
    pub attack: u32,
    pub defense: u32,
    pub maxHealth: u32,
    pub maxMana: u32,
    pub critChance: u32,
    // pub isActived: bool,
    // pub skillTypes: Array<felt252>,
}

#[derive(Drop, Serde)]
#[dojo::model]
pub struct HeroEventMeta {
    #[key]
    pub heroType: felt252,  
    #[key]
    pub event: felt252,
    pub imageUrl: ByteArray,
    pub description: ByteArray,
}

// #[derive(Drop, Serde)]
// #[dojo::model]
// pub struct SkillSpecs {
//     #[key]
//     pub skillType: felt252,
//     pub mana: u32,
//     pub critChance: u32,
//     pub damage: u32,
//     pub heal: u32,
//     pub healSelf: bool,
// }

// 记录一个battle instance的信息，包括当前round，参与英雄们等
#[derive(Drop, Serde, Introspect)]
#[dojo::model]
pub struct Battle {
    #[key]
    pub battleId: felt252,
    pub currRound: u128,
    pub heroIds: Array<felt252>,
}

// 记录一个英雄的HP
// #[derive(Copy, Drop, Serde)]
// #[dojo::model]
// pub struct Health {
//     #[key]
//     pub heroId: felt252,
//     pub health: u32,
// }

// 记录一个英雄的MP
// every attack will increase Mana by 1
// #[derive(Copy, Drop, Serde)]
// #[dojo::model]
// pub struct Mana {
//     #[key]
//     pub heroId: felt252,
//     pub mana: u32,
// }

// // every hero's own action will check if defend round is active, if not, delete the entry
// #[derive(Drop, Serde)]
// #[dojo::model]
// pub struct Defend {
//     #[key]
//     pub heroId: felt252,
//     pub defendAdded: u32,
//     pub activeRound: u128,
// }

// 记录一个dungeon & evel class的信息，包括怪物数量，怪物类型等
// mint random monster for dungeonId and level
#[derive( Drop, Serde)]
#[dojo::model]
pub struct DungeonLevelSpecs {
    #[key]
    pub dungeonType: felt252,

    pub level: u32,  //
    pub monsterAmount: u32,
    pub monsterTypes: Array<felt252>,
}


//  --- canPlayerAction || canDungoneAction: 地牢英雄需要在所有玩家英雄完成action后才能进行action
// 最后一个地牢英雄完成action后，set Battle.currRound += 1
// takeAction(heroId, action, targetId):
//  --- require heroId in same battle with targetId
//  --- require heroId's currRound == battleId's currRound
//  --- accumulate battleRound for heroId
// attack(heroId, targetId):
// defend(heroId):
// skill(heroId, skillId, targetId):

// ?? _burnHero(heroId):
//  --- check hero.health == 0; else return
//  --- remove from battle
//  --- _burn(entityId)

// 从battle脱出英雄
// _returnHero(heroId):
//  --- check hero.battleId != 0; else return
//  --- remove hero's battleId & currRound
