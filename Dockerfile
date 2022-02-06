FROM node:14

LABEL "com.github.actions.name"="Issue Bulk Labeler"
LABEL "com.github.actions.description"="Bulk add labels when creating an issue"
LABEL "com.github.actions.icon"="tag"
LABEL "com.github.actions.color"="green"

LABEL "repository"="http://github.com/tinkurlab/issue-labeler-action"
LABEL "homepage"="http://www.tinkurlab.com"
LABEL "maintainer"="Adam Zolyak <adam@tinkurlab.com>"

ADD entrypoint.sh /action/entrypoint.sh
ADD package.json /action/package.json
ADD app.js /action/app.js
ADD helpers.js /action/helpers.js

RUN chmod +x /action/entrypoint.sh

ENTRYPOINT ["/action/entrypoint.sh"]