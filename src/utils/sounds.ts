export const playSound = (type: 'score' | 'decrease' | 'start' | 'finish') => {
    if (typeof window === 'undefined') return;

    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'score':
                // High pitch "ding"
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'decrease':
                // Low pitch "bloop"
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.linearRampToValueAtTime(200, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'start':
                // Ascending Major Triad (Whistle-like)
                const startOsc = ctx.createOscillator();
                const startGain = ctx.createGain();
                startOsc.connect(startGain);
                startGain.connect(ctx.destination);
                
                startOsc.type = 'triangle';
                startGain.gain.setValueAtTime(0.1, now);
                
                // C5
                startOsc.frequency.setValueAtTime(523.25, now);
                // E5
                startOsc.frequency.setValueAtTime(659.25, now + 0.1);
                // G5
                startOsc.frequency.setValueAtTime(783.99, now + 0.2);
                
                startGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                
                startOsc.start(now);
                startOsc.stop(now + 0.4);
                break;

            case 'finish':
                // Victory Fanfare (Simple)
                const endOsc = ctx.createOscillator();
                const endGain = ctx.createGain();
                endOsc.connect(endGain);
                endGain.connect(ctx.destination);

                endOsc.type = 'square';
                endGain.gain.setValueAtTime(0.05, now);

                // G4
                endOsc.frequency.setValueAtTime(392.00, now);
                // C5
                endOsc.frequency.setValueAtTime(523.25, now + 0.15);
                // E5
                endOsc.frequency.setValueAtTime(659.25, now + 0.3);
                // C5 (Long)
                endOsc.frequency.setValueAtTime(523.25, now + 0.45);

                endGain.gain.setValueAtTime(0.05, now + 0.45);
                endGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

                endOsc.start(now);
                endOsc.stop(now + 1.0);
                break;
        }
    } catch (e) {
        console.error("Audio play failed", e);
    }
};
