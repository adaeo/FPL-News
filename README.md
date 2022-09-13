# How to setup on local
### In client folder
- npm install && npm run build 
### In server folder
- npm install && npm start

# Running with docker
docker run -e AWS_ACCESS_KEY_ID="KEY" -e AWS_SECRET_ACCESS_KEY="SECRET" -e AWS_SESSION_TOKEN="SESSION" --name assignment1 -p 8000:3000 -i -t n10771727/fullstack