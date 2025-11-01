import { ENDPOINT, SID, ZONE_ID } from "./constants.js";

const postData = async (path, body = {}, headers = {}) => {
    try {
        const response = await fetch(`${ENDPOINT}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                student_number: SID,
                uqcloud_zone_id: ZONE_ID,
                ...headers,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("Server returned an error.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error posting data:", error);
        return null;
    }
};

export { postData };
