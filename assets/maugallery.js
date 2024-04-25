(function() {
  function mauGallery(element, options) {
    options = Object.assign({}, mauGallery.defaults, options);
    var tagsCollection = [];

    element.forEach(function(el) {
      createRowWrapper(el);
      if (options.lightBox) {
        createLightBox(el, options.lightboxId, options.navigation);
      }
      listeners(options);

      Array.from(el.querySelectorAll('.gallery-item')).forEach(function(item) {
        responsiveImageItem(item);
        moveItemInRowWrapper(item);
        wrapItemInColumn(item, options.columns);
        var theTag = item.dataset.galleryTag;
        if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
          tagsCollection.push(theTag);
        }
      });

      if (options.showTags) {
        showItemTags(el, options.tagsPosition, tagsCollection);
      }

      el.style.display = 'block'; // fadeIn equivalent
    });
  }

  mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  function listeners(options) {
    document.querySelectorAll('.gallery-item').forEach(function(item) {
      item.addEventListener('click', function() {
        if (options.lightBox && this.tagName === 'IMG') {
          mauGallery.methods.openLightBox(this, options.lightboxId);
        } else {
          return;
        }
      });
    });

    document.querySelector('.gallery').addEventListener('click', function(e) {
      if (e.target.classList.contains('nav-link')) {
        mauGallery.methods.filterByTag.call(e.target);
      } else if (e.target.classList.contains('mg-prev')) {
        mauGallery.methods.prevImage(options.lightboxId);
      } else if (e.target.classList.contains('mg-next')) {
        mauGallery.methods.nextImage(options.lightboxId);
      }
    });
  }

  mauGallery.methods = {
    createRowWrapper: function(element) {
      if (!element.querySelector('.row')) {
        var row = document.createElement('div');
        row.className = 'gallery-items-row row';
        element.appendChild(row);
      }
    },
    wrapItemInColumn: function(element, columns) {
      if (typeof columns === 'number') {
        var column = document.createElement('div');
        column.className = 'item-column mb-4';
        column.classList.add('col-' + Math.ceil(12 / columns));
        element.parentNode.appendChild(column);
        column.appendChild(element);
      } else if (typeof columns === 'object') {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        var column = document.createElement('div');
        column.className = 'item-column mb-4' + columnClasses;
        element.parentNode.appendChild(column);
        column.appendChild(element);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },
    moveItemInRowWrapper: function(element) {
      element.parentNode.querySelector('.gallery-items-row').appendChild(element);
    },
    responsiveImageItem: function(element) {
      if (element.tagName === 'IMG') {
        element.classList.add('img-fluid');
      }
    },
    openLightBox: function(element, lightboxId) {
      document.getElementById(lightboxId).querySelector('.lightboxImage').src = element.src;
      document.getElementById(lightboxId).classList.toggle('show');
    },
    prevImage: function(lightboxId) {
      var activeImage = null;
      document.querySelectorAll('img.gallery-item').forEach(function(img) {
        if (img.src === document.querySelector('.lightboxImage').src) {
          activeImage = img;
        }
      });
      var activeTag = document.querySelector('.tags-bar span.active-tag').dataset.imagesToggle;
      var imagesCollection = [];
      if (activeTag === "all") {
        document.querySelectorAll('.item-column img').forEach(function(img) {
          imagesCollection.push(img);
        });
      } else {
        document.querySelectorAll('.item-column img').forEach(function(img) {
          if (img.dataset.galleryTag === activeTag) {
            imagesCollection.push(img);
          }
        });
      }
      var index = 0, next = null;

      imagesCollection.forEach(function(img, i) {
        if (activeImage.src === img.src) {
          index = i - 1;
        }
      });
      next = imagesCollection[index] || imagesCollection[imagesCollection.length - 1];
      document.querySelector('.lightboxImage').src = next.src;
    },
    nextImage: function(lightboxId) {
      var activeImage = null;
      document.querySelectorAll('img.gallery-item').forEach(function(img) {
        if (img.src === document.querySelector('.lightboxImage').src) {
          activeImage = img;
        }
      });
      var activeTag = document.querySelector('.tags-bar span.active-tag').dataset.imagesToggle;
      var imagesCollection = [];
      if (activeTag === "all") {
        document.querySelectorAll('.item-column img').forEach(function(img) {
          imagesCollection.push(img);
        });
      } else {
        document.querySelectorAll('.item-column img').forEach(function(img) {
          if (img.dataset.galleryTag === activeTag) {
            imagesCollection.push(img);
          }
        });
      }
      var index = 0, next = null;

      imagesCollection.forEach(function(img, i) {
        if (activeImage.src === img.src) {
          index = i + 1;
        }
      });
      next = imagesCollection[index] || imagesCollection[0];
      document.querySelector('.lightboxImage').src = next.src;
    },
    createLightBox: function(gallery, lightboxId, navigation) {
      var modalContent = `
        <div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '<span style="display:none;" />'}
              </div>
            </div>
          </div>
        </div>`;
      gallery.insertAdjacentHTML('beforeend', modalContent);
    },
    showItemTags: function(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">All</span></li>';
      tags.forEach(function(tag) {
        tagItems += `<li class="nav-item active"><span class="nav-link"  data-images-toggle="${tag}">${tag}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.insertAdjacentHTML('beforeend', tagsRow);
      } else if (position === "top") {
        gallery.insertAdjacentHTML('afterbegin', tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag: function() {
      if (this.classList.contains("active-tag")) {
        return;
      }
      document.querySelector('.active-tag').classList.remove("active", "active-tag");
      this.classList.add("active-tag");

      var tag = this.dataset.imagesToggle;

      document.querySelectorAll('.gallery-item').forEach(function(item) {
        item.parentNode.style.display = 'none';
        if (tag === "all" || item.dataset.galleryTag === tag) {
          item.parentNode.style.display = 'block';
        }
      });
    }
  };

  window.mauGallery = mauGallery;
})();