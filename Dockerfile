# step 1
FROM alpine

ARG MONGO_DB_ARG
ARG MONGO_USER_ARG
ARG MONGO_PASSWORD_ARG
ENV MONGO_DB $MONGO_DB_ARG
ENV MONGO_USER $MONGO_USER_ARG
ENV MONGO_PASSWORD $MONGO_PASSWORD_ARG

# step 2: install a software
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.16/main/' >> /etc/apk/repositories; 
RUN echo  'http://dl-cdn.alpinelinux.org/alpine/v3.16/community' >> /etc/apk/repositories
RUN apk update
RUN apk add --update npm
WORKDIR /usr/nodeapp
COPY ./ ./  
RUN npm install
#RUN npm rebuild

# step 2.5: Configure the software
   
#step 3: Set default commands. List of command as strings aeparated by space
CMD ["npm", "start"]