import { postFormData } from './modules/postFormData.js';

const INSERT_API_ENDPOINT = 'https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/community/'

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('community-form');
    const feedback = document.getElementById('form-feedback');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        feedback.textContent = 'Submitting...';
        const { success, data } = await postFormData(form, INSERT_API_ENDPOINT, {
            'student_number': 's4946038',
            'uqcloud_zone_id': '4e71d707',
        });

        if (success) {
            feedback.textContent = data.message;
            form.reset();
        } else {
            feedback.textContent = data.message || 'Something went wrong.';
        }
    });
});