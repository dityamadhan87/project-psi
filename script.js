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
        money: 5
    },
    states: {
        idle: {
            after: {
                5000: {
                    actions: [
                        () => {
                            document.getElementById('cat-poop').classList.remove('hidden');
                        }
                    ]
                }
            },
            on: {
                MEOW: {
                    target: 'meowing'
                },
                SLEEP: {
                    target: 'sleeping'
                },
                EAT_WHISKAS: {
                    target: 'eating',
                    cond: (context) => context.money >= 5,
                    actions: [
                        assign({
                            xp: (context) => context.xp + 150,
                            satiety: (context) => Math.min(100, context.satiety + 20),
                            money: (context) => Math.max(0, context.money - 5),
                        })
                    ],
                },
                EAT_FISH: {
                    target: 'eating',
                    cond: (context) => context.money >= 8,
                    actions: [
                        assign({
                            xp: (context) => context.xp + 200,
                            satiety: (context) => Math.min(100, context.satiety + 30),
                            money: (context) => Math.max(0, context.money - 8),
                        })
                    ],
                },
                BATH: {
                    target: 'bathing',
                },
                CLEAN_POOP: {
                    target: 'idle',
                    actions: [
                        assign({
                            money: (context) => context.money + 3,
                            cleanliness: (context) => Math.max(0, context.cleanliness - 10),
                            mood: (context) => Math.min(100, context.mood + 5),
                            satiety: (context) => Math.max(0, context.satiety - 10),
                            energy: (context) => Math.max(0, context.energy - 10),
                            xp: (context) => context.xp + 150
                        }),
                        () => {
                            document.getElementById('cat-poop').classList.add('hidden');
                        }
                    ]
                },
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
        },
        eating: {
            after: {
                5000: [
                    {
                    target: "idle",
                    actions: [
                        assign({
                            cleanliness: (context) => Math.max(0, context.cleanliness - 20),
                            mood: (context) => Math.min(100, context.mood + 10)
                        })
                    ],
                    },
                ],
            },
        },
        sleeping: {
            invoke: {
                id: 'sleepingInterval',
                src: (context, event) => (callback, onReceive) => {
                    const interval = setInterval(() => {
                        callback('TICK');
                    }, 1000);

                    return () => clearInterval(interval); // cleanup saat keluar dari state
                }
            },
            on: {
                TICK: {
                    actions: assign({
                        energy: (ctx) => Math.min(100, ctx.energy + 20),
                        satiety: (ctx) => Math.max(0, ctx.satiety - 5),
                        cleanliness: (ctx) => Math.max(0, ctx.cleanliness - 8),
                        mood: (ctx) => Math.min(100, ctx.mood + 20)
                    })
                }
            },
            after: {
                5000: { target: 'idle', actions: [
                    assign({
                        xp: (context) => context.xp + 200,
                    })
                ]},
            }
        },
        bathing: {
            after: {
                5000: {
                    target: 'idle',
                    actions: [
                        assign({
                            xp: (context) => context.xp + 250,
                            energy: (context) => Math.max(0, context.energy - 10),
                            cleanliness: (context) => Math.min(100, context.cleanliness = 100),
                            satiety: (context) => Math.max(0, context.satiety - 7),
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
    const soundBtn = document.getElementById('sound-btn');
    const sleepBtn = document.getElementById('sleep-btn');
    const bathBtn = document.getElementById('bath-btn');
    const feedBtn = document.getElementById('feed-btn');

    if (state.matches('meowing')) {
        cat.innerHTML = `<img src="./cat-meowing.png" alt="Cat Meowing" />`;
        new Audio('./cat-meow.mp3').play();
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else if (state.matches('sleeping')) {
        cat.innerHTML = `<img src="./cat-sleep.png" alt="Cat Sleeping" />`;
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sleepBtn.disabled = true;
        sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
        bathBtn.disabled = true;
        bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
        feedBtn.disabled = true;
        feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    else if (state.matches('eating')) {
        cat.innerHTML = `<img src="./cat-eating.png" alt="Cat Eating" />`;
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sleepBtn.disabled = true;
        sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
        bathBtn.disabled = true;
        bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
        feedBtn.disabled = true;
        feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    else if (state.matches('bathing')) {
        cat.innerHTML = `<img src="./cat-bathing.png" alt="Cat Bathing" />`;
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sleepBtn.disabled = true;
        sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
        bathBtn.disabled = true;
        bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
        feedBtn.disabled = true;
        feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        cat.innerHTML = `<img src="./cat.png" alt="Cat" />`;
        soundBtn.disabled = false;
        sleepBtn.disabled = false;
        bathBtn.disabled = false;
        feedBtn.disabled = false;
        soundBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        sleepBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        bathBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        feedBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

const feedBtn = document.getElementById('feed-btn');
const dropdown = document.getElementById('dropdown-feed-options');

document.getElementById('feed-btn').addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
    if (!feedBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Event listeners
document.getElementById('sound-btn').addEventListener('click', () => {
    service.send({ type: 'MEOW' });
});
document.getElementById('sleep-btn').addEventListener('click', () => {
    service.send({ type: 'SLEEP' });
});
document.getElementById('feed-whiskas').addEventListener('click', () => {
    service.send({ type: 'EAT_WHISKAS' });
});
document.getElementById('feed-fish').addEventListener('click', () => {
    service.send({ type: 'EAT_FISH' });
});
document.getElementById('bath-btn').addEventListener('click', () => {
    service.send({ type: 'BATH' });
});
document.getElementById('cat-poop').addEventListener('click', () => {
    service.send('CLEAN_POOP');
});

// Subscribe to state changes
service.onTransition((state) => {
    updateUI(state);
});

// Start the service
service.start();