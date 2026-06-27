class BasePlatform {
    constructor() {
        this.currentPlatform = 'facebook'; // default template version
        this.isLocalHost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:';

        this.detectPlatform();
        this.setupRobustMockSDKs();
    }

    detectPlatform() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('platform') === 'poki') {
            this.currentPlatform = 'poki';
        } else if (urlParams.get('platform') === 'crazygames' || urlParams.get('platform') === 'crazy') {
            this.currentPlatform = 'crazygames';
        } else if (urlParams.get('platform') === 'facebook' || urlParams.get('platform') === 'fb') {
            this.currentPlatform = 'facebook';
        } else {
            if (window.location.hostname.includes('poki') || window.location.href.includes('poki')) {
                this.currentPlatform = 'poki';
            } else if (window.location.hostname.includes('crazygames') || window.location.href.includes('crazygames')) {
                this.currentPlatform = 'crazygames';
            }
        }
    }

    setupRobustMockSDKs(force = false) {
        // Fallback stubs for Poki
        if (this.isLocalHost || force || !window.PokiSDK || typeof window.PokiSDK.init !== 'function') {
            window.PokiSDK = {
                init: () => new Promise((resolve) => {
                    console.log("[PokiSDK Mock] Initialized successfully");
                    resolve(true);
                }),
                gameplayStart: () => console.log("[PokiSDK Mock] gameplayStart"),
                gameplayStop: () => console.log("[PokiSDK Mock] gameplayStop"),
                commercialBreak: () => new Promise((resolve) => {
                    console.log("[PokiSDK Mock] commercialBreak running");
                    resolve();
                }),
                rewardedBreak: () => new Promise((resolve) => {
                    console.log("[PokiSDK Mock] rewardedBreak running");
                    resolve(true);
                })
            };
        }

        // Fallback stubs for Facebook Instant Games
        if (this.isLocalHost || force || !window.FBInstant || typeof window.FBInstant.initializeAsync !== 'function') {
            window.FBInstant = {
                initializeAsync: () => new Promise((resolve) => {
                    console.log("[FBInstant Mock] initializeAsync started");
                    resolve();
                }),
                setLoadingProgress: (prog) => console.log(`[FBInstant Mock] loadingProgress: ${prog}%`),
                startGameAsync: () => new Promise((resolve) => {
                    console.log("[FBInstant Mock] startGameAsync completed");
                    resolve();
                }),
                player: {
                    getName: () => "Local Slime Master",
                    getPhoto: () => "https://placehold.co/150x150/06b6d4/ffffff?text=ME",
                    getID: () => "12345678"
                },
                getLeaderboardAsync: (name) => new Promise((resolve) => {
                    resolve({
                        getName: () => name,
                        setScoreAsync: (score) => {
                            console.log(`[FBInstant Mock] setScoreAsync to: ${score}`);
                            return Promise.resolve({ getScore: () => score });
                        },
                        getEntriesAsync: (limit, offset) => {
                            return Promise.resolve([
                                { getRank: () => 1, getScore: () => 48200, getPlayer: () => ({ getName: () => "Me (Player)", getPhoto: () => "https://placehold.co/150x150/06b6d4/ffffff?text=ME" }) },
                                { getRank: () => 2, getScore: () => 38120, getPlayer: () => ({ getName: () => "Sophia Kim", getPhoto: () => "https://placehold.co/150x150/ec4899/ffffff?text=JY" }) },
                                { getRank: () => 3, getScore: () => 24950, getPlayer: () => ({ getName: () => "David Park", getPhoto: () => "https://placehold.co/150x150/f59e0b/ffffff?text=JS" }) }
                            ]);
                        }
                    });
                }),
                shareAsync: (config) => {
                    console.log("[FBInstant Mock] shareAsync triggered:", config);
                    return Promise.resolve();
                },
                context: {
                    chooseAsync: () => {
                        console.log("[FBInstant Mock] context.chooseAsync triggered");
                        return Promise.resolve();
                    }
                }
            };
        }

        // Fallback stubs for CrazyGames
        if (this.isLocalHost || force || !window.CrazyGames || !window.CrazyGames.SDK) {
            window.CrazyGames = {
                SDK: {
                    init: () => new Promise((resolve) => {
                        console.log("[CrazyGames SDK Mock] Initialized successfully");
                        resolve();
                    }),
                    game: {
                        loadingStart: () => console.log("[CrazyGames SDK Mock] loadingStart"),
                        loadingStop: () => console.log("[CrazyGames SDK Mock] loadingStop"),
                        gameplayStart: () => console.log("[CrazyGames SDK Mock] gameplayStart"),
                        gameplayStop: () => console.log("[CrazyGames SDK Mock] gameplayStop"),
                        happytime: () => console.log("[CrazyGames SDK Mock] happytime")
                    },
                    ad: {
                        requestAd: (type, callbacks) => {
                            console.log(`[CrazyGames SDK Mock] requestAd: ${type}`);
                            if (callbacks && typeof callbacks.adStarted === 'function') callbacks.adStarted();
                            setTimeout(() => {
                                if (callbacks && typeof callbacks.adFinished === 'function') callbacks.adFinished();
                                if (type === 'rewarded') {
                                    if (typeof claimAdReward === 'function') claimAdReward();
                                }
                            }, 1000);
                        }
                    }
                }
            };
        }
    }

    init() {
        return Promise.resolve();
    }

    gameplayStart() {}

    gameplayStop() {}

    happyTime() {}

    showInterstitial() {
        return Promise.resolve();
    }

    showRewarded(type) {
        return Promise.resolve();
    }

    adjustUI() {
        if (this.currentPlatform !== 'facebook') {
            const lbBtn = document.querySelector("button[onclick=\"openTab('leaderboard')\"]");
            const challengeBtn = document.querySelector("button[onclick=\"inviteFriends()\"]");
            const skinsBtn = document.querySelector("button[onclick=\"openTab('skins')\"]");
            
            if (lbBtn) lbBtn.style.display = 'none';
            if (challengeBtn) challengeBtn.style.display = 'none';
            
            if (skinsBtn && skinsBtn.parentElement) {
                const parent = skinsBtn.parentElement;
                parent.className = "flex justify-center w-full px-2";
                skinsBtn.className = "bg-slate-900/60 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl flex flex-col items-center text-center space-y-1 transition active:scale-95 w-1/3";
            }
            
            const shareBtn = document.querySelector("button[onclick=\"shareGameResult()\"]");
            if (shareBtn) shareBtn.style.display = 'none';
        }
    }

    inviteFriends() {
        showToast("Challenge sent to your friends!");
    }

    shareGameResult(score) {
        showToast("Successfully shared score!");
    }

    exitGame() {
        showToast("Thanks for playing!");
    }
}

window.BasePlatform = BasePlatform;
