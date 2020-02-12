# Developer Profile Generator


## Built with

* JavaScript
* Node
* 3rd-party API
* Bootstrap

## Overview

This is a command-line application that dynamically generates a PDF profile from a GitHub username. The application is invoked with the following command: "node index.js".

The user is prompted for a GitHub username and a favorite color, which will be used as the background color for cards.

The PDF will be populated with the following:

* Profile image
* User name
* Links to the following:
    * User location via Google Maps
    * User GitHub profile
    * User blog
* User bio
* Number of public repositories
* Number of followers
* Number of GitHub stars
* Number of users following

## User Story
```
As a product manager,
I want a developer profile generator,
So that I can easily prepare reports for stakeholders.
```