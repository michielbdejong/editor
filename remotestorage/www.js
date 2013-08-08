remoteStorage.defineModule('www', function(privateClient, publicClient) {
  var currCb = function() {},
    dirCb = function() {},
    currDir, currFile;
  function goToDir(path) {
    publicClient.getListing(path).then(function(arr) {
      console.log('contents of directory "'+path+'"', arr);
      currDir = path;
      var dirParts = path.split('/'),
      obj = { items: arr, dir: [] };
      for(var i=0; i<dirParts.length-1; i++) {
        obj.dir.push(dirParts[i]+'/');
      }
      dirCb(obj);
    }); 
  }
  function goToFile(path) {
    //publicClient.use(path).then(function() {
      currFile=path;
      console.log('now using '+path);
      publicClient.getFile(path).then(function(obj) {
        obj.path = path;
        currCb(obj);
      });
    //});
  }
  publicClient.on('change', function(event) {
    goToDir(currDir);
    if(event.relativePath == currFile && event.origin != 'window') {
      goToFile(currFile);
    }
  });
  return {
    exports: {
      up: function(path, type, content) {
        console.log('publicClient.storeFile', type, path, content);
        return publicClient.storeFile(type, path, content, false);
      },
      down: function(path) {
        publicClient.getFile(path).then(function(obj) {
          obj.path = path;
          currCb(obj);
        });
      },
      goToDir: goToDir,
      goToFile: goToFile,
      onDir: function(cb) {
        dirCb = cb;
      },
      onCurr: function(cb) {
        currCb = cb;
      }
    }
  };
});
