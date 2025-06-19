const { createMachine, assign, interpret } = XState;

// XState Machine
const meowlifeMachine = createMachine({
    id: 'meowlife',
    initial: 'idle',
    context: {
        energy: 50,
        satiety: 50,
        cleanliness: 50,
        mood: 50,
        xp: 0,
        money: 0
    },
    states: {
        idle: {
            on: {
                MEOW: {
                    target: 'meowing'
                }
            }
        },
        meowing: {
            after: {
                2000: {
                    target: 'idle',
                    actions: [
                        assign({
                            xp: (context) => context.xp + 100,
                            energy: (context) => Math.max(0, context.energy - 7),
                            satiety: (context) => Math.max(0, context.satiety - 10),
                            mood: (context) => Math.min(100, context.mood + 10)
                        })
                    ]
                }
            }
        }
    }
});

// Initialize service
const service = interpret(meowlifeMachine);

// Helper functions
function getBarWidth(value) {
    return Math.max(0, Math.min(100, value)) + '%';
}

function getLevel(xp) {
    return Math.floor(xp / 1000) + 1;
}

function getXPForCurrentLevel(xp) {
    return xp % 1000;
}

function getXPForNextLevel() {
    return 1000;
}

// Update UI function
function updateUI(state) {
    const context = state.context;

    // Update stat values
    document.getElementById('energy-value').textContent = context.energy;
    document.getElementById('satiety-value').textContent = context.satiety;
    document.getElementById('cleanliness-value').textContent = context.cleanliness;
    document.getElementById('mood-value').textContent = context.mood;
    document.getElementById('money-value').textContent = '$' + context.money;

    // Update progress bars
    document.getElementById('energy-bar').style.width = getBarWidth(context.energy);
    document.getElementById('satiety-bar').style.width = getBarWidth(context.satiety);
    document.getElementById('cleanliness-bar').style.width = getBarWidth(context.cleanliness);
    document.getElementById('mood-bar').style.width = getBarWidth(context.mood);

    // Update experience
    const level = getLevel(context.xp);
    const currentXP = getXPForCurrentLevel(context.xp);
    const nextLevelXP = getXPForNextLevel();

    document.getElementById('level-value').textContent = 'Level ' + level;
    document.getElementById('current-xp').textContent = currentXP + ' XP';
    document.getElementById('next-level-xp').textContent = nextLevelXP + ' XP';
    document.getElementById('xp-bar').style.width = getBarWidth((currentXP / nextLevelXP) * 100);

    // Handle meowing state
    const cat = document.getElementById('cat');
    const meowBubble = document.getElementById('meow-bubble');
    const soundBtn = document.getElementById('sound-btn');

    if (state.matches('meowing')) {
        cat.classList.add('animate-bounce');
        meowBubble.classList.remove('hidden');
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        cat.classList.remove('animate-bounce');
        meowBubble.classList.add('hidden');
        soundBtn.disabled = false;
        soundBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Event listeners
document.getElementById('sound-btn').addEventListener('click', () => {
    service.send({ type: 'MEOW' });
});

// Subscribe to state changes
service.onTransition((state) => {
    updateUI(state);
});

// Start the service
service.start();

// Initial UI update
updateUI(service.getSnapshot());