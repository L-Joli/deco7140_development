import { postData } from "../postData.js";

export const postDiscussion = async (formEl) => {
    try {
        const data = await postData(formEl, "multiphotopost/");

        if (!data) {
            throw new Error("No data returned from server.");
        }

        return data;
    } catch (error) {
        console.error("Error in postDiscussion:", error);
        return null;
    }
};
