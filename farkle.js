// ----------------------< Game rules constants  >-----------------------------------------------------------------------
// Rules can be parametrized by this globals constants
//
// Standard Farkle rules :
//  5 dices with 6 faces
//  1 & 5 are scoring
//  1 is scoring 100 pts
//  5 is scoring 50 pts
//
//  Bonus for 3 dices with the same value
//   3 ace is scoring 1000 pts
//   3 time the same dice value is scoring 100 pts x the dice value

const NB_DICE_SIDE = 6  // Nb of side of the Dices
const SCORING_DICE_VALUE = [1, 5]  // list_value of the side values of the dice who trigger a standard score
const SCORING_MULTIPLIER = [100, 50]  // list_value of multiplier for standard score

const THRESHOLD_BONUS = 3  // Threshold of the triggering for bonus in term of occurrence of the same slide value
const STD_BONUS_MULTIPLIER = 100  // Standard multiplier for bonus
const ACE_BONUS_MULTIPLIER = 1000  // Special multiplier for aces bonus

const DEFAULT_DICES_NB = 5  // Number of dices by default in the set

const getRandomDiceValue = (max) => {
    return ( Math.floor(Math.random() * max) + 1 )
}

const roll_dice_set = (nb_dice_to_roll) => {

    let dice_value_occurrence = [...Array(NB_DICE_SIDE).fill(0)]
    let dice_index = 0
    while (dice_index < nb_dice_to_roll) {
        const dice_value = getRandomDiceValue(NB_DICE_SIDE)
        dice_value_occurrence[dice_value - 1] += 1
        dice_index += 1
    }

    return dice_value_occurrence
}

const analyse_bonus_score = (dice_value_occurrence) => {
    let scoring_dice_value_occurrence = [...Array(NB_DICE_SIDE).fill(0)]

    let bonus_score = 0
    let side_value_index = 0
    while ( side_value_index < dice_value_occurrence.length ) {

        let side_value_occurrence = dice_value_occurrence[side_value_index]

        let nb_of_bonus = side_value_occurrence // THRESHOLD_BONUS
        if (nb_of_bonus > 0){
            let bonus_multiplier
            if (side_value_index == 0){
                bonus_multiplier = ACE_BONUS_MULTIPLIER
            } else {
                bonus_multiplier = STD_BONUS_MULTIPLIER
                bonus_score += nb_of_bonus * bonus_multiplier * (side_value_index + 1)

                // update the occurrence list after bonus rules for scoring dices and non scoring dices
                dice_value_occurrence[side_value_index] %= THRESHOLD_BONUS
                scoring_dice_value_occurrence[side_value_index] = nb_of_bonus * THRESHOLD_BONUS
            }
        }
        side_value_index += 1
    }
    return {'score': bonus_score,
            'scoring_dice': scoring_dice_value_occurrence,
            'non_scoring_dice': dice_value_occurrence}
}


const analyse_standard_score = (dice_value_occurrence) => {
    let scoring_dice_value_occurrence = [...Array(NB_DICE_SIDE).fill(0)]

    let standard_score = 0
    let scoring_dice_value_index = 0
    while (scoring_dice_value_index < SCORING_DICE_VALUE.length) {
        let scoring_value = SCORING_DICE_VALUE[scoring_dice_value_index]
        let scoring_multiplier = SCORING_MULTIPLIER[scoring_dice_value_index]

        standard_score += dice_value_occurrence[scoring_value - 1] * scoring_multiplier

        // update the occurrence list after standard rules for scoring dices and non scoring dices
        scoring_dice_value_occurrence[scoring_value - 1] = dice_value_occurrence[scoring_value - 1]
        dice_value_occurrence[scoring_value - 1] = 0

        scoring_dice_value_index += 1
    }
    return {'score': standard_score,
            'scoring_dice': scoring_dice_value_occurrence,
            'non_scoring_dice': dice_value_occurrence}
}

const analyse_score = (dice_value_occurrence) => {
    let analyse_score_bonus = analyse_bonus_score(dice_value_occurrence)
    let score_bonus = analyse_score_bonus['score']
    let scoring_dice_from_bonus = analyse_score_bonus['scoring_dice']
    let non_scoring_dice_from_bonus = analyse_score_bonus['non_scoring_dice']

    let analyse_score_std = analyse_standard_score(non_scoring_dice_from_bonus)
    let score_std = analyse_score_std['score']
    let scoring_dice_from_std = analyse_score_std['scoring_dice']
    let non_scoring_dice_from_std = analyse_score_std['non_scoring_dice']

    // the occurrence list of scoring dice value is the sum from scoring dice by bonus and standard rules
    let scoring_dice_value_occurrence = [...Array(NB_DICE_SIDE).fill(0)]
    let side_value_index = 0
    while (side_value_index < NB_DICE_SIDE) {
        scoring_dice_value_occurrence[side_value_index] = scoring_dice_from_bonus[side_value_index] + scoring_dice_from_std[side_value_index]
        side_value_index += 1
    }
    return {'score': score_std + score_bonus,
            'scoring_dice': scoring_dice_value_occurrence,
            'non_scoring_dice': non_scoring_dice_from_std}
}

const game_turn = (is_interactive=true) => {
    let remaining_dice_to_roll = DEFAULT_DICES_NB
    let roll_again = true
    const current_player = {'name': 'Player', 'score': 0, 'lost_score': 0, 'nb_of_roll': 0, 'nb_of_turn': 0, 'nb_of_scoring_turn': 0, 'nb_of_non_scoring_turn': 0, 'nb_of_full_roll': 0}

    let turn_score = 0
    while (roll_again) {
        let dice_value_occurrence = roll_dice_set(remaining_dice_to_roll)
        let roll_score = analyse_score(dice_value_occurrence)
        remaining_dice_to_roll = roll_score['non_scoring_dice'].reduce((a, b) => a + b, 0)

        if (roll_score['score'] == 0) {

            console.log('\n-->', 'got zero point ', turn_score, 'lost points\n')

            roll_again = false
            turn_score = 0
        } else {
            turn_score += roll_score['score']

            if (remaining_dice_to_roll == 0) {
                remaining_dice_to_roll = DEFAULT_DICES_NB
                console.log('-->Full Roll')
            }
            console.log('Roll Score=', roll_score['score'], 'potential turn score=', turn_score, 'remaining dice=', remaining_dice_to_roll)

            let stop_turn
            if (is_interactive) {
                stop_turn = prompt("Do you want to roll this dice ? [y/n] ")
            } else {
                stop_turn = (Math.floor(Math.random() * 100) % 2) === 0
            }
            if (stop_turn) {
                console.log('\n-->', current_player['name'], 'Scoring turn with', turn_score, 'points\n')

                roll_again = false
            }
        }
    }
    return turn_score
}

game_turn(false)