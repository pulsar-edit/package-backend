CREATE TABLE authstate (
    id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
    keycode VARCHAR(256) NOT NULL UNIQUE,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Query for the cleanup of the unused keys to be executed
-- regularly on the server by a cron job service.
DELETE FROM authstate
WHERE CURRENT_TIMESTAMP > created + INTERVAL '2 minutes';
