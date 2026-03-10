async function runTests() {
    const baseUrl = 'http://localhost:3000';
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    try {
        console.log("Starting Phase 4 Verification...");

        const res1 = await fetch(`${baseUrl}/api/ministries?fy=2024-25`);
        const data1 = await res1.json();
        assert(data1.length === 4, `GET /api/ministries returned ${data1?.length} ministries (expected 4)`);

        const res2 = await fetch(`${baseUrl}/api/schemes?sort=finalScore`);
        const data2 = await res2.json();
        let isSorted = true;
        for (let i = 0; i < data2.length - 1; i++) {
            if (data2[i].finalScore < data2[i + 1].finalScore) isSorted = false;
        }
        assert(data2.length > 0 && isSorted, "GET /api/schemes?sort=finalScore returns schemes in descending order");

        const res3 = await fetch(`${baseUrl}/api/feedback`, { method: 'POST', body: JSON.stringify({}) });
        assert(res3.status === 401, `POST /api/feedback without auth returns 401 (got ${res3.status})`);

        console.log("\nAttempting Authentication to test protected routes...");
        const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.csrfToken;
        const initialCookies = csrfRes.headers.get('set-cookie');

        const authRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": initialCookies
            },
            body: new URLSearchParams({ email: "priya.sharma@finance.gov.in", password: "Admin@123", csrfToken, json: "true" }).toString()
        });

        const finalCookies = authRes.headers.get('set-cookie') || '';
        const sessionCookieStr = finalCookies.split(';').find(c => c.includes('auth.session-token') || c.includes('next-auth.session-token')) || finalCookies;

        let newFeedbackId = null;
        if (authRes.ok) {
            const fbRes = await fetch(`${baseUrl}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookieStr },
                body: JSON.stringify({
                    schemeId: data2[0].id,
                    title: "This is a comprehensive test feedback title",
                    body: "This is a comprehensive test feedback body that meets the 50 character length requirement for the endpoint.",
                    category: "POLICY_SUGGESTION"
                })
            });
            const fbText = await fbRes.text();
            assert(fbRes.status === 200, `POST /api/feedback created record (Status: ${fbRes.status})`);
            try {
                const fbData = JSON.parse(fbText);
                newFeedbackId = fbData.id;
            } catch (e) {
                console.error("Failed to parse POST /api/feedback response:", fbText.slice(0, 100));
            }

            if (newFeedbackId) {
                console.log("\nTesting vote toggling for ID:", newFeedbackId);
                const vote1Res = await fetch(`${baseUrl}/api/feedback/${newFeedbackId}/vote`, {
                    method: "POST",
                    headers: { 'Cookie': sessionCookieStr, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: "UP" })
                });
                const vote1Text = await vote1Res.text();
                try {
                    const vote1Data = JSON.parse(vote1Text);
                    assert(vote1Data.voteCount === 1, `First vote toggle count is 1 (got ${vote1Data.voteCount})`);
                } catch (e) { assert(false, `Vote 1 failed: ${vote1Text}`); }

                const vote2Res = await fetch(`${baseUrl}/api/feedback/${newFeedbackId}/vote`, {
                    method: "POST",
                    headers: { 'Cookie': sessionCookieStr, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: "UP" })
                });
                const vote2Text = await vote2Res.text();
                try {
                    const vote2Data = JSON.parse(vote2Text);
                    assert(vote2Data.voteCount === 0, `Second vote toggle count is 0 (got ${vote2Data.voteCount})`);
                } catch (e) { assert(false, `Vote 2 failed: ${vote2Text}`); }
            } else {
                assert(false, "Failed to capture Feedback ID for voting test");
            }
        } else {
            assert(false, "Authentication flow failed, cannot test protected endpoints.");
        }

        const res6 = await fetch(`${baseUrl}/api/scores/distribution`);
        const data6 = await res6.json();
        assert(data6.total === 16, `GET /api/scores/distribution totals sum to 16 (got ${data6?.total})`);

        console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
    } catch (err) {
        console.error("Test execution failed:", err);
    }
}

runTests();
