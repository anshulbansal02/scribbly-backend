const GameEvents = Object.freeze({
    START: "game:start",
    END: "game:end",
    ROUND_START: "game:round:start",
    ROUND_END: "game:round:end",
    TURN_START: "game:turn:start",
    TURN_END: "game:turn:end",
    WORD_CHOICE_START: "game:word_choice:start",
    WORD_CHOICE_END: "game:word_choice:end",
    GUESS_START: "game:guess:start",
    GUESS_END: "game:guess:end",
});

const GameDefaults = Object.freeze({
    WORD_CHOICE_TIMEOUT: 10000,
    WORD_CHOICES_NUMBER: 3,
});

export { GameDefaults, GameEvents };
