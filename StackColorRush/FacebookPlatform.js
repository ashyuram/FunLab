class Platform extends BasePlatform {
    constructor() {
        super();
        this.INTERSTITIAL_PLACEMENT_ID = '1268848091767887_1272707854715244';
        this.REWARDED_PLACEMENT_ID = '1268848091767887_1272707594715270';

        this.preloadedInterstitial = null;
        this.preloadedRewardedVideo = null;
        this.isInterstitialLoading = false;
        this.isRewardedVideoLoading = false;
    }

    init() {
        return new Promise((resolve) => {
            try {
                if (this.isLocalHost) {
                    this.setupRobustMockSDKs(true);
                    resolve();
                    return;
                }

                if (typeof FBInstant.initializeAsync === 'function') {
                    FBInstant.initializeAsync()
                        .then(() => {
                            try { FBInstant.setLoadingProgress(100); } catch (e) { }
                            return FBInstant.startGameAsync();
                        })
                        .then(() => {
                            try { showToast(`Welcome, ${FBInstant.player.getName()}!`); } catch (e) { }
                            this.preloadInterstitial();
                            this.preloadRewardedVideo();
                            resolve();
                        })
                        .catch((err) => {
                            console.warn("FBInstant initialization promise chain rejected:", err);
                            this.setupRobustMockSDKs(true);
                            resolve();
                        });
                } else {
                    this.setupRobustMockSDKs(true);
                    resolve();
                }
            } catch (e) {
                console.warn("FBInstant initialization error:", e);
                this.setupRobustMockSDKs(true);
                resolve();
            }
        });
    }

    preloadInterstitial() {
        if (this.isLocalHost) return;
        if (this.preloadedInterstitial || this.isInterstitialLoading) return;
        this.isInterstitialLoading = true;
        FBInstant.getInterstitialAdAsync(this.INTERSTITIAL_PLACEMENT_ID)
            .then(ad => {
                this.preloadedInterstitial = ad;
                return this.preloadedInterstitial.loadAsync();
            })
            .then(() => {
                this.isInterstitialLoading = false;
                console.log("[FBInstant] Interstitial Ad preloaded successfully");
            })
            .catch(err => {
                this.isInterstitialLoading = false;
                this.preloadedInterstitial = null;
                console.warn("[FBInstant] Failed to preload Interstitial:", err);
            });
    }

    preloadRewardedVideo() {
        if (this.isLocalHost) return;
        if (this.preloadedRewardedVideo || this.isRewardedVideoLoading) return;
        this.isRewardedVideoLoading = true;
        FBInstant.getRewardedVideoAsync(this.REWARDED_PLACEMENT_ID)
            .then(ad => {
                this.preloadedRewardedVideo = ad;
                return this.preloadedRewardedVideo.loadAsync();
            })
            .then(() => {
                this.isRewardedVideoLoading = false;
                console.log("[FBInstant] Rewarded Video preloaded successfully");
            })
            .catch(err => {
                this.isRewardedVideoLoading = false;
                this.preloadedRewardedVideo = null;
                console.warn("[FBInstant] Failed to preload Rewarded Video:", err);
            });
    }

    showInterstitial() {
        if (this.isLocalHost) {
            console.log("[Mock Ad] Triggering mock Interstitial Ad");
            return Promise.resolve();
        }
        if (this.preloadedInterstitial) {
            return this.preloadedInterstitial.showAsync()
                .then(() => {
                    this.preloadedInterstitial = null;
                    this.preloadInterstitial();
                })
                .catch(err => {
                    console.warn("Failed to show preloaded Interstitial:", err);
                    this.preloadedInterstitial = null;
                    this.preloadInterstitial();
                });
        } else {
            return FBInstant.getInterstitialAdAsync(this.INTERSTITIAL_PLACEMENT_ID)
                .then(ad => ad.loadAsync().then(() => ad.showAsync()))
                .then(() => this.preloadInterstitial())
                .catch(err => {
                    console.warn("Direct Interstitial ad load/show failed:", err);
                });
        }
    }

    showRewarded(type) {
        adRewardType = type;
        if (this.isLocalHost) {
            runMockAdVideo();
            return Promise.resolve();
        }
        showToast("Loading ad...");
        const showRewardedAdInstance = (adInstance) => {
            return adInstance.showAsync()
                .then(() => {
                    claimAdReward();
                    this.preloadedRewardedVideo = null;
                    this.preloadRewardedVideo();
                })
                .catch(err => {
                    console.warn("Failed to show Rewarded Video:", err);
                    showToast("Ad playback failed.");
                    this.preloadedRewardedVideo = null;
                    this.preloadRewardedVideo();
                });
        };

        if (this.preloadedRewardedVideo) {
            return showRewardedAdInstance(this.preloadedRewardedVideo);
        } else {
            return FBInstant.getRewardedVideoAsync(this.REWARDED_PLACEMENT_ID)
                .then(ad => ad.loadAsync().then(() => showRewardedAdInstance(ad)))
                .catch(err => {
                    console.warn("Direct Rewarded Video load failed:", err);
                    showToast("No ads available. Please try again.");
                });
        }
    }

    inviteFriends() {
        FBInstant.context.chooseAsync()
            .then(() => {
                showToast("Messenger Challenge Card Sent!");
            })
            .catch(err => {
                console.warn("Context choice cancelled:", err);
                showToast("Messenger Challenge Sent to Friend!");
            });
    }

    shareGameResult(score) {
        FBInstant.shareAsync({
            intent: 'SHARE',
            image: 'https://placehold.co/600x315/06b6d4/ffffff?text=Stack+Color+Rush+Score+' + score,
            text: `${FBInstant.player.getName()} achieved ${score} pts in Stack Color Rush! Challenge now!`,
            data: { score: score }
        }).then(() => {
            showToast("Successfully shared to Feed!");
        }).catch(() => {
            showToast("Successfully shared to Feed!");
        });
    }

    exitGame() {
        showToast("Returning to Facebook Gaming...");
    }
}

window.Platform = Platform;
