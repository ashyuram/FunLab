class Platform extends BasePlatform {
    init() {
        console.log("[CrazyGames SDK] init() triggered");
        return new Promise((resolve) => {
            try {
                if (this.isLocalHost) {
                    console.log("[CrazyGames SDK] Localhost detected, initializing mock SDK");
                    this.setupRobustMockSDKs(true);
                    resolve();
                    return;
                }

                if (window.CrazyGames && window.CrazyGames.SDK) {
                    console.log("[CrazyGames SDK] SDK objects found on window. Automatically initialized.");
                    resolve();
                } else {
                    console.warn("[CrazyGames SDK] window.CrazyGames or SDK object not found on window, fallback to mock");
                    this.setupRobustMockSDKs(true);
                    resolve();
                }
            } catch (e) {
                console.error("[CrazyGames SDK] Exception during init():", e);
                this.setupRobustMockSDKs(true);
                resolve();
            }
        });
    }

    gameplayStart() {
        console.log("[CrazyGames SDK] gameplayStart() triggered");
        
        // Add a slight delay to ensure the events do not overlap in the platform log queue
        setTimeout(() => {
            try {
                console.log("[CrazyGames SDK] Calling SDK.game.gameplayStart()");
                window.CrazyGames.SDK.game.gameplayStart();
            } catch (e) {
                console.warn("[CrazyGames SDK] SDK.game.gameplayStart failed:", e);
            }
        }, 100);
    }

    gameplayStop() {
        console.log("[CrazyGames SDK] gameplayStop() triggered");
        try {
            console.log("[CrazyGames SDK] Calling SDK.game.gameplayStop()");
            window.CrazyGames.SDK.game.gameplayStop();
        } catch (e) {
            console.warn("[CrazyGames SDK] SDK.game.gameplayStop failed:", e);
        }
    }

    happyTime() {
        console.log("[CrazyGames SDK] happyTime() triggered");
        try {
            console.log("[CrazyGames SDK] Calling SDK.game.happytime()");
            window.CrazyGames.SDK.game.happytime();
        } catch (e) {
            console.warn("[CrazyGames SDK] SDK.game.happytime failed:", e);
        }
    }

    showInterstitial() {
        console.log("[CrazyGames SDK] showInterstitial() triggered");
        if (this.isLocalHost) {
            console.log("[CrazyGames SDK] Localhost simulation, skipping actual requestAd('midgame')");
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            console.log("[CrazyGames SDK] Calling SDK.ad.requestAd('midgame')...");
            window.CrazyGames.SDK.ad.requestAd("midgame", {
                adStarted: () => {
                    console.log("[CrazyGames SDK] Midgame adStarted event fired");
                    showToast("Ad started");
                },
                adFinished: () => {
                    console.log("[CrazyGames SDK] Midgame adFinished event fired");
                    resolve();
                },
                adError: (error) => {
                    console.warn("[CrazyGames SDK] Midgame adError event fired:", error);
                    resolve();
                }
            });
        });
    }

    showRewarded(type) {
        console.log(`[CrazyGames SDK] showRewarded() triggered with type: ${type}`);
        adRewardType = type;
        if (this.isLocalHost) {
            console.log("[CrazyGames SDK] Localhost simulation, triggering mock claimAdReward()");
            claimAdReward();
            return Promise.resolve();
        }
        showToast("Loading ad...");
        return new Promise((resolve) => {
            console.log("[CrazyGames SDK] Calling SDK.ad.requestAd('rewarded')...");
            window.CrazyGames.SDK.ad.requestAd("rewarded", {
                adStarted: () => {
                    console.log("[CrazyGames SDK] Rewarded adStarted event fired");
                },
                adFinished: () => {
                    console.log("[CrazyGames SDK] Rewarded adFinished event fired. Claiming reward.");
                    claimAdReward();
                    resolve();
                },
                adError: (error) => {
                    console.warn("[CrazyGames SDK] Rewarded adError event fired:", error);
                    showToast("Ad playback failed.");
                    resolve();
                }
            });
        });
    }

    requestBanner(containerId, width, height) {
        console.log(`[CrazyGames SDK] requestBanner() triggered for container: ${containerId}`);
        try {
            if (this.isLocalHost) {
                console.log("[CrazyGames SDK] Localhost simulation, skipping actual requestBanner");
                return;
            }
            window.CrazyGames.SDK.banner.requestBanner({
                id: containerId,
                width: width,
                height: height
            });
        } catch (e) {
            console.warn("[CrazyGames SDK] requestBanner failed:", e);
        }
    }

    clearBanner(containerId) {
        console.log(`[CrazyGames SDK] clearBanner() triggered for container: ${containerId}`);
        try {
            if (this.isLocalHost) {
                console.log("[CrazyGames SDK] Localhost simulation, skipping actual clearBanner");
                return;
            }
            window.CrazyGames.SDK.banner.clearBanner(containerId);
        } catch (e) {
            console.warn("[CrazyGames SDK] clearBanner failed:", e);
        }
    }

    exitGame() {
        console.log("[CrazyGames SDK] exitGame() triggered");
        showToast("Thanks for playing on CrazyGames!");
    }
}

window.Platform = Platform;
