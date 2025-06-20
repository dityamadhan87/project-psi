const { createMachine, assign, interpret } = XState;

// XState Machine
const meowlifeMachine = createMachine({
    id: 'meowlife',
    initial: 'idle',
    context: {
        energy: 50,
        energyAwal: 0, // <--- untuk menyimpan nilai awal sebelum tidur
        satiety: 50,
        cleanliness: 50,
        mood: 0,
        lv: 1,
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
            always: [
                {
                    cond: (context) => context.xp >= 1000,
                    target: 'celebrate',
                    actions:[
                        assign({
                            lv: (context) => context.lv + 1,
                        })
                    ]
                },
                {
                    cond: (context) => context.mood >= 100,
                    target: 'reward',
                    actions: [
                        assign({
                            mood: (context) => Math.max(0, context.mood - 100),
                        })
                    ]
                }
            ],
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
                            satiety: (context) => Math.min(100, context.satiety + 30),
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
                            satiety: (context) => Math.min(100, context.satiety + 40),
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
                6000: [
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
            entry: assign({
                energyAwal: (ctx) => ctx.energy
            }),
            invoke: {
                id: 'sleepingInterval',
                src: (context, event) => (callback, onReceive) => {
                    const interval = setInterval(() => {
                        callback('TICK');
                    }, 1000);
                    return () => clearInterval(interval);
                }
            },
            always: [
                {
                    cond: (ctx) => ctx.energy >= 100,
                    target: 'idle',
                    actions: assign({
                        xp: (ctx) => ctx.xp + 200
                    })
                }
            ],
            on: {
                TICK: {
                    actions: assign({
                        energy: (ctx) => Math.min(100, ctx.energy + 5),
                        mood: (ctx) => Math.min(100, ctx.mood + 2),
                        satiety: (ctx) => Math.max(0, ctx.satiety - 2),
                        cleanliness: (ctx) => Math.max(0, ctx.cleanliness - 4)
                    })
                },
                WAKE_UP: {
                    target: 'idle',
                    actions: assign({
                        xp: (ctx) => {
                            const kenaikan = ctx.energy - ctx.energyAwal;
                            return ctx.xp + Math.floor(kenaikan * 1.5);
                        }
                    })
                }
            },
        },   
        bathing: {
            after: {
                7000: {
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
        },
        reward: {
            after: {
                8000: {
                    target: 'idle',
                    actions: [
                        assign({
                            money: (context) => context.money + 20,
                            xp: (context) => context.xp + 200,
                        })
                    ]
                }
            }
        },
        celebrate: {
            after: {
                8000: {
                    target: 'idle',
                    actions: [
                        assign({
                            money: (context) => context.money + 30,
                            xp: (_) => 0,
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
    const level = context.lv;
    const currentXP = getXPForCurrentLevel(context.xp);
    const nextLevelXP = getXPForNextLevel();

    document.getElementById('level-value').textContent = 'Level ' + level;
    document.getElementById('current-xp').textContent = currentXP + ' XP';
    document.getElementById('next-level-xp').textContent = nextLevelXP + ' XP';
    document.getElementById('xp-bar').style.width = getBarWidth((currentXP / nextLevelXP) * 100);

    // Handle meowing state
    const cat = document.getElementById('cat');
    const loveLove = document.getElementById('love1');
    const soundBtn = document.getElementById('sound-btn');
    const sleepBtn = document.getElementById('sleep-btn');
    const bathBtn = document.getElementById('bath-btn');
    const feedBtn = document.getElementById('feed-btn');
    const dropdown = document.getElementById('dropdown-feed-options');
    const celebrate = document.getElementById('celebrate');
    const wakeUp = document.getElementById('wake-up');

    // Toggle dropdown saat tombol diklik
    feedBtn.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
    });
    // Sembunyikan dropdown saat klik di luar area dropdown
    document.addEventListener('click', (event) => {
    if (!feedBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
    });

    if (state.matches('meowing')) {
        cat.innerHTML = `<img src="./cat-meowing.png" alt="Cat Meowing" />`;
        new Audio('./cat-meow.mp3').play();
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sleepBtn.disabled = true;
        sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
        bathBtn.disabled = true;
        bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
        feedBtn.disabled = true;
        feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } 
    else if (state.matches('sleeping')) {
        cat.innerHTML = `<img src="./cat-sleep.png" alt="Cat Sleeping" />`;
        new Audio('./cat-sleping.wav').play();
        wakeUp.classList.remove('hidden');
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
        new Audio('./cat-eating.mp3').play();
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
        new Audio('./cat-bath-shower.wav').play();
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sleepBtn.disabled = true;
        sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
        bathBtn.disabled = true;
        bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
        feedBtn.disabled = true;
        feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    else if (state.matches('reward')) {
        cat.innerHTML = `<img src="./cat-happy.gif" alt="Cat Happy" />`;
        new Audio('./cat-happy.mp3').play();
        loveLove.classList.remove('hidden');
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sleepBtn.disabled = true;
        sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
        bathBtn.disabled = true;
        bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
        feedBtn.disabled = true;
        feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    else if (state.matches('celebrate')) {
        cat.innerHTML = `<img src="./cat-celebration.gif" alt="cat Celebrate" />`;
        new Audio('./celebrate.mp3').play();
        celebrate.classList.remove('hidden');
        soundBtn.disabled = true;
        soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sleepBtn.disabled = true;
        sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
        bathBtn.disabled = true;
        bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
        feedBtn.disabled = true;
        feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    else {
        cat.innerHTML = `<img src="./cat.png" alt="Cat" />`;
        loveLove.classList.add('hidden');
        celebrate.classList.add('hidden');
        wakeUp.classList.add('hidden');
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

// Event listeners
document.getElementById('sound-btn').addEventListener('click', () => {
    service.send({ type: 'MEOW' });
});

const msg = document.getElementById('sleep-msg');
document.getElementById('sleep-btn').addEventListener('click', () => {
    const { energy } = service.getSnapshot().context;
    if (energy >= 100) {
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    } else {
        service.send('SLEEP');
        msg.classList.add('hidden'); // sembunyikan pesan jika sebelumnya muncul
    }
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
document.getElementById('wake-up').addEventListener('click', () => {
    service.send('WAKE_UP');
});


// Subscribe to state changes
service.onTransition((state) => {
    updateUI(state);
});

// Start the service
service.start();