(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    function createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    }

    function wrapItemInColumn(element, columns) {
      var columnClasses = "";
      if (columns.constructor === Number) {
        columnClasses = ` col-${Math.ceil(12 / columns)}`;
      } else if (columns.constructor === Object) {
        $.each(columns, function(size, value) {
          columnClasses += ` col-${size}-${Math.ceil(12 / value)}`;
        });
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
        return;
      }
      element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
    }

    function moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    }

    function responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    }

    function openLightBox(element, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    }

    function prevImage(lightboxId) {
      var activeImage = $("img.gallery-item[src='" + $(".lightboxImage").attr("src") + "']");
      var activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      var imagesCollection = $(".item-column").filter(function() {
        return activeTag === "all" || $(this).children("img").data("gallery-tag") === activeTag;
      }).children("img");

      var index = imagesCollection.index(activeImage);
      var next = imagesCollection.eq((index - 1 + imagesCollection.length) % imagesCollection.length);
      $(".lightboxImage").attr("src", next.attr("src"));
    }

    function nextImage(lightboxId) {
      var activeImage = $("img.gallery-item[src='" + $(".lightboxImage").attr("src") + "']");
      var activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      var imagesCollection = $(".item-column").filter(function() {
        return activeTag === "all" || $(this).children("img").data("gallery-tag") === activeTag;
      }).children("img");

      var index = imagesCollection.index(activeImage);
      var next = imagesCollection.eq((index + 1) % imagesCollection.length);
      $(".lightboxImage").attr("src", next.attr("src"));
    }

    function createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId || "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
              <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
              ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>' : '<span style="display:none;" />'}
            </div>
          </div>
        </div>
      </div>`);
    }

    function showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">All</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
          <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    }

    function filterByTag() {
      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        var itemColumn = $(this).closest(".item-column");
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          itemColumn.show(300);
        } else {
          itemColumn.hide();
        }
      });

      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");
    }

    return this.each(function() {
      createRowWrapper($(this));
      if (options.lightBox) {
        createLightBox($(this), options.lightboxId, options.navigation);
      }
      $(".gallery-item", this).each(function() {
        responsiveImageItem($(this));
        moveItemInRowWrapper($(this));
        wrapItemInColumn($(this), options.columns);
        var theTag = $(this).data("gallery-tag");
        if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
          tagsCollection.push(theTag);
        }
      });
      if (options.showTags) {
        showItemTags($(this), options.tagsPosition, tagsCollection);
      }
      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $(".gallery").on("click", ".gallery-item", function() {
    var options = $(this).closest(".gallery").data("mauGalleryOptions");
    if (options.lightBox && $(this).prop("tagName") === "IMG") {
      openLightBox($(this), options.lightboxId);
    } else {
      return;
    }
  });

  $(".gallery").on("click", ".nav-link", filterByTag);
  $(".gallery").on("click", ".mg-prev", function() {
    var options = $(this).closest(".gallery").data("mauGalleryOptions");
    prevImage(options.lightboxId);
  });
  $(".gallery").on("click", ".mg-next", function() {
    var options = $(this).closest(".gallery").data("mauGalleryOptions");
    nextImage(options.lightboxId);
  });
})(jQuery);