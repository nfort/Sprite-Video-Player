function createVideoFromSprites(config) {
  /* countColumnFrames - количество линии на которых распологаются кадры */

  this.videoContainer = document.getElementsByClassName(config.className)[0];
  // Контеинер с спрайтом
  this.videoSpriteContainer = null;
  // Контеинер с изображением
  this.videoImageContainer = null;
  // указатель текущего кадра
  this.currentNumberFrame = 1;
  // кол-во линии в sprite
  this.countRowFrames = config.countRowFrames;
  // указатель текущего ряда
  this.currentRowFrames = 1;
  // кол-во кадров в спраите
  this.countFrames = config.countFrames;
  // максимальное кол-во кадров на одной линии
  this.countMaxFramesOnRow = null;
  // ширина видео контеинера
  this.widthVideoContainer = null;
  // высота видео контеинера
  this.heightVideoContainer = null;
  // ширина спрайта
  this.widthSprite = null;
  // высота спрайта
  this.heightSprite = null;
  // ширина фрейма
  this.widthFrame = null;
  // высота фрейма
  this.heightFrame = null;
  // поддержка translate
  this.supportedTransform = null;
  // Названия класса в котором храниться видео спрайта
  this.videoClass = 'video-sprite-' + Date.now();
  // кол-во загруженных изображений
  this.countDownloadImages = 0;
  // указывает на текущий проигрываем sprite, берем из массива, поэтому он ровняется 0
  this.currentPlaySprite = 0;

  this.init = function() {
    this.appendVideoSprite();
    this.whenImagesLoaded = this.downloadImages();
    this.getComputedSizeFrame();

    this.supportedTransform = this.getSupportedProp(['transform', 'webkitTransform']);
    // После ресайзе окна будем пересчитывать размер фрейма
    window.onresize = this.getComputedSizeFrame.bind(this);
  };

  /**
   * Добавляет контеинер для видео
   */
  this.appendVideoSprite = function() {
    var el = document.createElement('div'),
      img = document.createElement('img');

    el.className = this.videoClass;
    this.videoContainer.appendChild(el);

    this.videoSpriteContainer = document.getElementsByClassName(this.videoClass)[0];
    this.videoSpriteContainer.appendChild(img);
    this.videoImageContainer = this.videoSpriteContainer.getElementsByTagName('img')[0];
  };

  /**
   * Загружает изображения из массива
   */
  this.downloadImages = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (typeof config.src === 'object' && Array.isArray(config.src)) {
        config.src.forEach(function(src, index) {
          var image = new Image();
          image.src = src;
          image.onload = function() {
            if (index === 0) {
              self.setImageSprite(0);
            }

            var isImagesLoaded = self.imagesLoaded(index, src);
            if (isImagesLoaded) {
              resolve();
            }
          };
        });
      }
    });
  };

  /**
   * Определяет загужено ли изображение
   * @param index {number} - индекс в config.img
   * @param src {string} - src на изображение
   */
  this.imagesLoaded = function(index, src) {
    this.countDownloadImages = this.countDownloadImages + 1;
    return this.countDownloadImages === config.src.length;
  };

  this.setImageSprite = function(index) {
    this.videoImageContainer.src = config.src[index];
  };

  /**
   * Вычисляет размеры кадра для текущего контеинера
   */
  this.getComputedSizeFrame = function() {
    this.widthSprite = parseInt(config.widthSprite, 10);
    this.heightSprite = parseInt(config.heightSprite, 10);

    this.widthFrame = parseInt(config.widthFrame, 10);
    this.heightFrame = parseInt(config.heightFrame, 10);

    this.widthVideoContainer = this.getWidthNode(config.className);
    this.heightVideoContainer = this.getHeightResolution(this.widthVideoContainer);

    this.videoSpriteContainer.style.height = this.heightVideoContainer + 'px';
    this.videoSpriteContainer.style.width = this.widthVideoContainer + 'px';

    this.setFrame(this.getCurrentFrame(), true);
    this.countMaxFramesOnRow = this.getCountMaxFramesOnRow();
  };

  /**
   * Поддерживает ли свойство
   * @param prop
   * @returns {string}
   */
  this.getSupportedProp = function(prop) {
    var documentElement = document.documentElement;
    for (var i = 0; i < prop.length; i++) {
      if (prop[i] in documentElement.style) {
        return prop[i];
      }
    }
  };

  /**
   * Получаем ширину элементу по классу
   * @param className {string}
   * @returns {number}
   */
  this.getWidthNode = function(className) {
    return document.getElementsByClassName(className)[0].offsetWidth;
  };

  /**
   * Возвращает высоту элемента по классу
   * @param className {string}
   * @returns {number}
   */
  this.getHeightNode = function(className) {
    return document.getElementsByClassName(className)[0].offsetHeight;
  };

  /**
   * Возвращает высоту текущего контеинера
   * @param height
   * @returns {number}
   */
  this.getWidthResolution = function(height) {
    return  height * this.widthFrame / this.heightFrame;
  };

  /**
   * Возвращает ширину текущего контеинера
   * @param width
   * @returns {number}
   */
  this.getHeightResolution = function(width) {
    return width * this.heightFrame / this.widthFrame;
  };

  /**
   * Возвращает количество кадров
   * @returns {number} - возвращает количество кадров
   */
  this.getCountFrames = function() {
    return this.widthSprite / this.widthFrame * (this.heightSprite / (this.heightSprite / this.countRowFrames));
  };

  /**
   * Возвращает максимальное количество кадров на одной линии
   * @returns {number} - возвращает максимальное количество кадров на одной линии
   */
  this.getCountMaxFramesOnRow = function() {
    return this.widthSprite / this.widthFrame;
  };

  /**
   * Устанавливает кадр
   * @param {number} frame  - текущий кадр
   * @param {boolean}  notChangeFrameCount - флаг отвечает за установку следующего кадра
   * @returns {undefined}
   */
  this.setFrame = function(frame, notChangeFrameCount) {
    var coordinateX;
    var coordinateY;

    if (frame > this.countFrames || frame < 1) return;

    if (!notChangeFrameCount) {
      this.currentNumberFrame = frame;
    }

    var isNextSprite = this.currentNumberFrame % this.countMaxFramesOnRow === 1 && this.currentNumberFrame !== 1;

    if (isNextSprite) {
      this.currentPlaySprite = this.currentPlaySprite + 1;
      this.setImageSprite(this.currentPlaySprite);
    }

    if ((this.currentNumberFrame % this.countMaxFramesOnRow) === 0) {
      coordinateX = (this.countMaxFramesOnRow - 1) * this.widthVideoContainer;
    } else {
      coordinateX = ((this.currentNumberFrame % this.countMaxFramesOnRow) - 1) * this.widthVideoContainer;
    }

    /**
     * Рассчитывается если количество row превышает 1
     */
    if ((this.currentNumberFrame / this.countMaxFramesOnRow) * this.countMaxFramesOnRow === this.currentNumberFrame
      && this.currentNumberFrame % this.countMaxFramesOnRow === 0) {
      coordinateY = (Math.ceil(this.currentNumberFrame / this.countMaxFramesOnRow) - 1) * this.heightVideoContainer;
    } else {
      coordinateY = (Math.ceil(this.currentNumberFrame / this.countMaxFramesOnRow) - 1) * this.heightVideoContainer;
    }
    //  берем так как количество row ограничем 1, соотвестенно перемещение по оси Y не будет
    coordinateY = 0;

    this.videoSpriteContainer.style[this.supportedTransform] = 'translate(-' + coordinateX  + 'px, -' + coordinateY + 'px)';

    this.videoImageContainer.style.width = (this.widthVideoContainer * this.countMaxFramesOnRow) + 'px';
    this.videoImageContainer.style.height = (this.heightVideoContainer * this.countRowFrames) + 'px';
    this.videoImageContainer.style.visibility = 'visible';
    this.videoImageContainer.style.maxWidth = 'inherit';

    if (!notChangeFrameCount) {
      if (this.currentNumberFrame !== this.countFrames) {
        this.currentNumberFrame = this.currentNumberFrame + 1;
      }
    }

    this.getConsoleData();
  };

  /**
   * Установить следующий кадр
   * @returns {undefined} - показывает следующий кадр
   */
  this.setNextFrame = function() {
    this.setFrame(this.currentNumberFrame, false);
  };

  this.play = function() {
    var self = this;

    this.whenImagesLoaded.then(function() {
      self.setImageSprite(self.currentPlaySprite);
      var playVideo = function() {
        self.setNextFrame();
        if (self.getCurrentFrame() === self.getCountFrame()) {
          clearInterval(self.videoPlayer);
          self.currentNumberFrame = 1;
          self.currentPlaySprite = 0;
        }
      };
      self.videoPlayer = setInterval(playVideo.bind(self), 1000 / config.fps);
    }).catch(function() {
      console.log('error');
    });
  };

  this.pause = function() {
    clearInterval(this.videoPlayer);
  };

  this.stop = function() {
    clearInterval(this.videoPlayer);
    this.videoPlayer = undefined;
    this.setFrame(1, true);
  };

  /**
   * Получить текущий кадр
   * @returns {number} - текущий кадр
   */
  this.getCurrentFrame = function() {
    return this.currentNumberFrame;
  };

  /**
   * Получить кол-во кадров в спрайте
   * @returns {number} - число кадров
   */
  this.getCountFrame = function() {
    return this.countFrames;
  };

  /**
   * Выводить в консоли откладочную информацию
   * @returns {undefined}
   */
  this.getConsoleData = function() {
    console.log('widthVideoContainer ', this.widthVideoContainer, 'heightVideoContainer ',
      this.heightVideoContainer, 'widthFrame ', this.widthFrame, 'heightFrame ', this.heightFrame,
      'widthSprite ', this.widthSprite, 'heightSprite ', this.heightSprite,
      'currentNumberFrame ', this.currentNumberFrame, 'countRowFrames ', this.countRowFrames,
      'currentRowFrames ', this.currentRowFrames, 'countFrames ', this.countFrames,
      'countMaxFramesOnRow ', this.countMaxFramesOnRow);
  };
}

module.exports = createVideoFromSprites;