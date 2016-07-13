# Demo Application

1. Copy the MongoDB folder to Desktop and rename to mongo
2. Execute this command to start MongoDB server
On macOS

```
/Users/xxx/Desktop/mongo/bin/mongod --dbpath .
```

On Windows
```
\Users\xxx\Desktop\mongo\bin\mongod --dbpath . --storageEngine=mmapv1
```

3. Clone the project using these commands:
```
git clone https://github.com/codestar-work/demo
cd demo
npm install express ejs mongodb multer
```

4. Start the project by this command:
```
node app.js
```

5. Open your browser to localhost:8000
