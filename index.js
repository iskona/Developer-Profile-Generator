const fs = require("fs");
const util = require("util");
const axios = require("axios");
const inquirer = require("inquirer");

const pdf = require('html-pdf');
const options = { format: 'Tabloid', orientation: 'landscape' };

const writeFileAsync = util.promisify(fs.writeFile);


function convertToPDF(html, name) {

    pdf.create(html, options).toFile(`./${name}.pdf`, function (err, res) {
        if (err) return console.log(err);
        console.log(res); // { filename: './{username}.pdf' }
    });
}


function getUserData() {

    return inquirer.prompt([
        {
            type: 'input',
            name: "username",
            message: "Enter your GitHub username"
        },
        {
            type: 'list',
            name: "color",
            message: "What's your favorite color?",
            choices: [
                'salmon',
                'blue',
                'green',
                'pink',
                'red']
        }
    ])
}

const colors = {
    salmon: {
        wrapperBackground: "#5F64D3",
        headerBackground: "salmon",
        headerColor: "white"
    },
    blue: {
        wrapperBackground: "#5F64D3",
        headerBackground: "#26175A",
        headerColor: "white"
    },
    green: {
        wrapperBackground: "#E6E1C3",
        headerBackground: "#C1C72C",
        headerColor: "rgb(79, 109, 165)"
    },
    pink: {
        wrapperBackground: "#879CDF",
        headerBackground: "#FF8374",
        headerColor: "white"
    },
    red: {
        wrapperBackground: "#DE9967",
        headerBackground: "#870603",
        headerColor: "white"
    }
};


function generateHTML(answers, gitHubData, stars) {

    return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
        integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <script src='https://kit.fontawesome.com/a076d05399.js'></script>
    <link href="https://fonts.googleapis.com/css?family=Abril+Fatface|Josefin+Sans&display=swap" rel="stylesheet">
    <title>GitHub Profile</title>
    <style>
    html, body {
        margin: 0;
        height: 100%;
    }
    header {
        margin-bottom: 10vh;
    }
    footer {
        height: 25vh;
        background-color: ${colors[answers.color].headerBackground};
    }
    img {
        width: 40vh;
    }
    .bio {
        margin: 2rem;
        font-family: 'Abril Fatface', cursive;
        color: rgb(79, 109, 165);
    }
    .card-body {
        color: ${colors[answers.color].headerColor};
        font-family: 'Josefin Sans', sans-serif;
        background-color: ${colors[answers.color].wrapperBackground};
    }
    .card-header {
        background-color: ${colors[answers.color].headerBackground};
    }
    .btn {
        color: ${colors[answers.color].headerColor};
    }
    </style>
</head>
<body>
    <header></header>
    <div class="container">
        <div class="card text-center">
            <div class="card-header">
                <img src="${gitHubData.avatar_url}" class="img-fluid img-thumbnail rounded-circle" alt="profile image">
            </div>
            <div class="card-body">
                <h5 class="card-title">Hi!</h5>
                <h5 class="card-title">My name is ${gitHubData.name} and username ${answers.username}</h5>
                <h5 class="card-title">Currently @ ${gitHubData.company}</h5>
                <a href="https://www.google.ru/maps/place/${gitHubData.location}/" class="btn"><i class='fas fa-location-arrow'></i> ${gitHubData.location}</a>
                <a href="${gitHubData.html_url}" class="btn"><i class="fab fa-github"></i> GitHub</a>
                <a href="${gitHubData.blog}" class="btn"><i class='fas fa-rss'></i> Blog</a>
            </div>
        </div>
        <div class="container">
            <h3 class="text-center bio">${gitHubData.bio}</h3>
        </div>
        <div class="row row-cols-1 row-cols-md-2">
            <div class="col mb-4">
                <div class="card w-85 text-center">
                    <div class="card-body">
                        <h5 class="card-title">Public Repositories</h5>
                        <h5 class="card-title">${gitHubData.public_repos}</h5>
                    </div>
                </div>
            </div>
            <div class="col mb-4">
                <div class="card w-85 text-center">
                    <div class="card-body">
                        <h5 class="card-title">Followers</h5>
                        <h5 class="card-title">${gitHubData.followers}</h5>
                    </div>
                </div>
            </div>
            <div class="col mb-4">
                <div class="card w-85 text-center">
                    <div class="card-body">
                        <h5 class="card-title">GitHub Stars</h5>
                        <h5 class="card-title">${stars}</h5>
                    </div>
                </div>
            </div>
            <div class="col mb-4">
                <div class="card w-85 text-center">
                    <div class="card-body">
                        <h5 class="card-title">Following</h5>
                        <h5 class="card-title">${gitHubData.following}</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <footer></footer>
</body>
</html>`;
}


async function init() {

    console.log("Getting started...");
    
    try {

        const answers = await getUserData();

        const { data } = await axios.get(`https://api.github.com/users/${answers.username}`);

        const stars = await axios.get(data.repos_url).then((res) => {
            let starCount = 0;
            for (let i = 0; i < res.data.length; i++) {
                starCount += res.data[i].stargazers_count;
            }
            return starCount;
        });

        const html = await generateHTML(answers, data, stars);

        await writeFileAsync(`${answers.username}.html`, html);

        console.log(`Successfully wrote to ${answers.username}.html`);

        await convertToPDF(html, answers.username);

    } catch (err) {
        console.log(err);
    }
}

init();