import { postData } from "../postData.js";

export const postRepo = async (formEl) => {
    try {
        const data = await postData(formEl, "genericproduct/");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error in postRepo:", error);
        return null;
    }
};
