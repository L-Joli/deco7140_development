import { ENDPOINT, SID, ZONE_ID } from "./constants.js";

const fetchData = async (path, headers = {}) => {
    try {
        const response = await fetch(`${ENDPOINT}${path}`, {
            method: "GET",
            headers: {
                student_number: SID,
                uqcloud_zone_id: ZONE_ID,
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error("Server returned an error.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

export { fetchData };
