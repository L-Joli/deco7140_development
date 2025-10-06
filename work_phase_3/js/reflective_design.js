import { fetchGetData } from "./modules/getData.js";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("community-list");

    fetchGetData(
        " https://damp-castle-86239-1b70ee448fbd.herokuapp.com/decoapi/community/",
        {
            student_number: "s4946038",
            uqcloud_zone_id: "4e71d707",
        }
    ).then((data) => {
        if (!data) {
            container.innerHTML =
                '<p class="text-danger">Unable to load community members.</p>';
        } else if (data.length == 0) {
            container.innerHTML = "<p>No members yet. Invite someone to join!</p>";
        }

        data.forEach((member) => {
            const card = document.createElement("div");
            card.className = "card mb-3";
            card.innerHTML = `
    <img src="${member.photo || "assets/default-icon.png"}" alt="${member.name}'s photo" />
    <div class="card-content">
        <h5 class="card-title">${member.name}</h5>
        <p class="card-text">${member.message || "No message provided."}</p>
    </div>
`;
            container.appendChild(card);
        });
    });
});
