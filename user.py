class User():
  id = ""
  email = ""
  username = ""
  password = ""

  def __init__(self, id, email, username):
    self.id = id
    self.email = email
    self.username = username

  # Flask-Login integration
  def is_authenticated(self):
    return True

  def is_active(self):
    return True

  def is_anonymous(self):
    return False

  def get_id(self):
    return self.id
