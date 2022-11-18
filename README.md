This is a Docker containerised Express JS server with a React JS client that utilises data from the FPL API, newscatcher API and image-charts to function. The application is designed to run with AWS EC2 infrastructure with access to S3 storage.

To run this project, you will need to replace the following ENV keys with the docker run command. All previous keys used in this project no longer work.

docker run -e AWS_ACCESS_KEY_ID="ACCESS" -e AWS_SECRET_ACCESS_KEY="SECRET" -e AWS_SESSION_TOKEN="SESSION" -e NEWS_API_KEY="KEY"
