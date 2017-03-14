exports.up = function(next) {
   this
    .model('User')
    .update(
      {},
      {
        $set: { createdAt: Date.now() }
      },
      {
        multi: true,
        strict: false
      },
      function (error) {
        if (error) {
          console.error(error);
        }
        next();
      }
    );
};

exports.down = function(next) {
  this
    .model('User')
    .update(
      {},
      {
        $unset: { createdAt: 1 }
      },
      {
        multi: true,
        strict: false
      },
      function (error) {
        if (error) {
          console.error(error);
        }
        next();
      }
    );
};