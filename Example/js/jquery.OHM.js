var ListMap = {};
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function isBool(v) {
    return (v == true) || (v == false);
}
function GetFrmValue(el,oldVal) {
    var isCheckbox = el.filter(":checkbox").length > 0;
    var isDropDown = el.filter("select").length > 0;
    var isText = el.filter("input,textarea").length > 0;
    var newVal =""
    if (isCheckbox) {
        newVal = el.attr("checked") + "";
    }
    else {
        if (isDropDown) {
            newVal = el.find("option:selected").val()
        }
       else {
           if (isText) {
               newVal = el.val();
           }
           else {
               newVal = el.html();
           }
        }
   }
   if (isNumber(oldVal)) {
       if (isNumber(newVal)) {
           return parseFloat(newVal);
       }
     
  }
  if (isBool(oldVal)) {
      return newVal == "true";
  }

  return newVal;
}
function SetFrmValue(el,val,isEdit) {
    var isCheckbox = el.filter(":checkbox").length > 0;
    var isDropDown = el.filter("select").length > 0;
    var isText = el.filter("input,textarea").length > 0;
    if (isCheckbox) {
        var boolval = (val == "true" || val);
        el.attr("checked", boolval);

    }
    else {
        if (isDropDown) {
            el.find(" option[value='" + val + "']").attr("selected", "selected");
            
        }
        else {
            if (isText) {
                el.val(val);
        
            }
            else {
                el.html(val);
            }
        }
    }
}
function removeClick(arg1) {
    jQuery(arg1.currentTarget).parents().filter('.' + arg1.data.prefix + arg1.data.prp + "_item").remove();
}
function addClick(arg) {

    var listContainer = $('.' + arg.data.prefix + arg.data.prp);
    var items = [arg.data.listMapItem.DefaultObject];
    arg.data.listMapItem.ApplyTemplate(listContainer, items, arg.data.prefix + arg.data.prp + "_");

    var newItem = jQuery(arg.data.container.find('.' + arg.data.prefix + arg.data.prp + "_item").last());
    arg.data.listMapItem.PreItemBind(newItem, arg.data.listMapItem.DefaultObject);
    newItem.find(arg.data.listMapItem.DeleteBtnSelector).click(arg.data, removeClick);
    LoadObjectToForm(arg.data.listMapItem.DefaultObject, arg.data.prefix + arg.data.prp + "_", newItem, true, ListMap);
    arg.data.listMapItem.PostItemBind(newItem, arg.data.listMapItem.DefaultObject);
}

function LoadObjectToForm(data, prefix, container, isEdit, listMap) {
    ListMap = listMap;
    for (var propName in data) {
        var propValue = data[propName];
        var isArray = jQuery.isArray(propValue);
        var isObject = jQuery.isPlainObject(propValue);
        if (isArray) {
            // Get Template For Item
       
            var listContainer = container.find('.' + prefix + propName)
            //clear the list container and apply template
            var listMapItem = { ApplyTemplate: function (listContainer, items, prefix) {
            },
                PreItemBind: function (container, item) {

                }
                             ,
                PostItemBind: function (container, item) {

                },
                DefaultObject: {} ,
                AddBtnSelector: "",
                DeleteBtnSelector: ""
            };
            if (ListMap !=null) {
                jQuery.extend(listMapItem, ListMap[propName]);
            }
          
            listMapItem.ApplyTemplate(listContainer, propValue, prefix + propName + "_");
            //apply bind event like casscade or disabeling form items
            
            container.find('.' + prefix + propName + "_item").each(function (i,el) {
                listMapItem.PreItemBind(jQuery(el), propValue[i]);
                LoadObjectToForm(propValue[i], prefix + propName + "_", jQuery(el), true, ListMap);
                listMapItem.PostItemBind(jQuery(el), propValue[i]);
            });
            var eventData = { prp: propName, prefix: prefix, container: container,listMapItem :listMapItem };
            if (listMapItem.DeleteBtnSelector != "") {
                container.find(listMapItem.DeleteBtnSelector).click(eventData, removeClick);
            }
            if (listMapItem.AddBtnSelector != "") {
                jQuery(listMapItem.AddBtnSelector).click(eventData, addClick);
            }
           
             
        }
        if (isObject) {
            LoadObjectToForm(propValue, prefix + propName + "_", container, true, listMap);
        }
        if (!isArray && !isObject) {

            SetFrmValue(container.find("." + prefix + propName), propValue, isEdit);
        }

    }
}
function GetObjectFromForm(data, prefix, container, listMap) {
    ListMap = listMap;
    for (var propName in data) {
        var propValue = data[propName];
        var isArray = jQuery.isArray(propValue);
        var isObject = jQuery.isPlainObject(propValue);
        if (isArray) {
            // Get Template For Item
            var listContainer = container.find('.' + prefix + propName)
            var listMapItem = { ApplyTemplate: function (listContainer, items, prefix) {
            },
                PreItemBind: function (container, item) {

                }
                             ,
                PostItemBind: function (container, item) {

                },
                DefaultObject: {},
                AddBtnSelector: "",
                DeleteBtnSelector: ""
            };
            if (ListMap != null) {
                jQuery.extend(listMapItem, ListMap[propName]);
            }
            var emptyobj = listMapItem.DefaultObject;
            if (isEmpty(emptyobj)) {
                emptyobj = clone(propValue[0]);
            }

            propValue.length = 0;
   
            var i = 0;
            var items = container.find("." + prefix + propName + "_item"); // jQuery("*[class^='" + prefix + propName + "_" + i + "_" + "']").length > 0;
        
            items.each(function (i,el) {
                var struc = clone(emptyobj);
                var item = GetObjectFromForm(struc, prefix + propName + "_", jQuery(el), listMap);
                propValue.push(item);
                i++;
            });
   

        }
        if (isObject) {

            var item = GetObjectFromForm(propValue, prefix + propName + "_", container, listMap);
            data[propName] = item;
        }
        if (!isArray && !isObject) {

            var item = GetFrmValue(container.find('.' + prefix + propName), data[propName]);
            data[propName] = item;
        }

    }
    return data;
}
function isEmpty(ob) {
    for (var i in ob) { return false; }
    return true;
}
function clone(obj) {
//    if (null == obj || "object" != typeof obj) return obj;
//    var copy = obj.constructor();
//    for (var attr in obj) {
//        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
//    }
    //    return copy;
    var copy = {};
    jQuery.extend(true,copy, obj);
    return copy;
}
(function ($) {

    //Attach this new method to jQuery
    $.fn.extend({

        //This is where you write your plugin's name
        HtmlToObject: function (data, listMap) {
            return GetObjectFromForm(clone(data), "", this, listMap)
        }
    });

})(jQuery);


(function ($) {

    //Attach this new method to jQuery
    $.fn.extend({

        //This is where you write your plugin's name
        ObjectToHtml: function (data, listMap) {

            LoadObjectToForm(data, "", this, true, listMap);
            return this;
        }
    });

})(jQuery);