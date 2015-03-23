1.) copy settings.json.sample to settings.json and configure appropriately
2.) run with:
        meteor --settings settings.json
  -- or --
2.) build with docker:
        docker build -t muster .
    and run with docker:
        docker run -it --rm --name=muster -p 3000:80 \
            -e REBUILD_NPM_MODULES=1 \
            -e MONGO_URL=mongodb://ip_addr:27017/muster \
            -e ROOT_URL=http://localhost:3000/ \
            -e METEOR_SETTINGS="$(cat settings.json)" \
            muster
