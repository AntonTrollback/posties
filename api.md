# Routes

/          GET    ()
/:site     GET    (name)
/signup    POST   (email, password)
/signin    POST   (email, password)
/signout   GET    ()

/api/user/check      POST        (email)
/---/user/create     POST        (email, password)
/---/user/password   POST AUTH   (id, password, oldPassword)
/---/user/delete     POST AUTH   (id, password)

/api/site/check    POST        (name)
/api/site/create   POST        (name, parts, designSettings)
/api/site/design   POST AUTH   (id, designSettings)
/---/site/delete   POST AUTH   (id)

/api/part/create    POST AUTH     (id, type, content)
/api/part/edit      POST AUTH     (id, content)
/api/part/reorder   POST AUTH     (id, order)
/api/part/delete    DELETE AUTH   (id)

# Modules

- user
- site
- part