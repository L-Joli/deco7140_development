import { ENDPOINT, SID, ZONE_ID } from "./constants.js";

const postData = async (formEl, path, headers = {}) => {
    const formData = new FormData(formEl);
    const newFormData = new FormData();

    for (const [key, value] of formData.entries()) {
        if (key === "photos") {
            continue;
        } else {
            const snakeCaseKey = key.replace(/-/g, "_");
            newFormData.append(snakeCaseKey, value);
        }
    }

    const photos = formData.getAll("photos");

    photos.forEach((file, index) => {
        if (file && file.size > 0) {
            newFormData.append(`photo${index + 1}`, file);
        }
    });

    try {
        const response = await fetch(`${ENDPOINT}${path}`, {
            method: "POST",
            headers: {
                student_number: SID,
                uqcloud_zone_id: ZONE_ID,
                ...headers,
            },
            body: newFormData,
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
