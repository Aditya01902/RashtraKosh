const puter = require('@heyputer/puter.js');

async function test() {
    try {
        console.log("Testing puter.js...");
        const response = await puter.ai.chat("Explain black holes", { model: 'gemini-3-flash-preview' });
        console.log("Response:", response);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
