export default {
    app: {
        token: "cda3b978a0484d30829ac9c9649170a7", // <- enter your token here
        muted: true, // <- mute microphone by default
        googleIt: false // <- ask users to google their request, in case of input.unknown action
    },
    locale: {
        strings: {
            welcomeTitle: "Find Cross Reference Model",
            welcomeDescription: "example: What is the alternative model for NEK6160Z?",
            offlineTitle: "Oh, no!",
            offlineDescription: "It looks like you are not connected to the internet, this webpage requires internet connection, to process your requests",
            queryTitle: "Ask me something...",
            voiceTitle: "Go ahead, im listening..."
        },
        settings: {
            speechLang: "en-GB", // <- output language
            recognitionLang: "en-US" // <- input(recognition) language
        }
    }
}