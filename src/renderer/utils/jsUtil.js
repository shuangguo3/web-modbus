

// import { extend } from "vue/types/umd";

/**
 * js相关的通用函数
 */

export default {
  // 把obj2的所有属性（包括不可枚举）合并到obj1，并返回obj1，如果有重复属性，obj2将覆盖obj1
  extend(obj1, obj2) {
    const props = Object.getOwnPropertyNames(obj2);
    // const dest = this;
    props.forEach(function(name) {
      const propVal = Object.getOwnPropertyDescriptor(obj2, name);
      Object.defineProperty(obj1, name, propVal);
    });

    return obj1;
  },

  // 深度合并对象（不是真正意义的深拷贝，只是深拷贝了object，如果是数组就忽略）
  objectDeepClone(des, src) {
    // console.log('des', des);
    // console.log('src', src);

    // 只获取可枚举属性
    const srcKeys = Object.keys(src);

    for (const field of srcKeys) {
      // console.log('field', field);
      const copy = src[field];

      /*
      if (!copy) {
        console.log('555');
        continue;
      }
      */

      if (copy instanceof Function) {
        // console.log('444');
        continue;
        // 【重要】先判断是否Array，如果是数组和普通类型一样处理，否则数组会被判断为Object（Array也是Object）
      } else if (copy instanceof Array) {
        // console.log('333');
        des[field] = src[field];
      } else if (copy instanceof Object) {
        // console.log('222', des, src, field);
        if (!des[field]) {
          des[field] = {};
        }
        this.objectDeepClone(des[field], copy);
      } else {
        console.log('111', des, src, field);
        des[field] = src[field];
      }
    }

    return des;
  },

  /**
   * 深度合并对象，把src对象合并复制到des中
   * 如果元素是对象，就递归进行复制
   * 如果源和目标元素都是数组，就合并数组
   * @param {object} des
   * @param {object} src
   */
  deepClone(des, src) {
    // 只获取可枚举属性
    const srcKeys = Object.keys(src);

    for (const name of srcKeys) {
      const copy = src[name];
      if (!copy) {
        continue;
      }

      if (copy instanceof Function) {
        continue;
        // 【重要】先判断是否Array，如果是数组和普通类型一样处理，否则数组会被判断为Object（Array也是Object）
      } else if (copy instanceof Array) {
        // 如果目标元素也是数组，就合并数组，否则就直接覆盖
        if (des[name] instanceof Array) {
          des[name] = copy.concat(des[name]);
        } else {
          des[name] = src[name];
        }
      } else if (copy instanceof Object) {
        if (!des[name]) {
          des[name] = {};
        }
        this.deepClone(des[name], copy);
      } else {
        des[name] = src[name];
      }
    }

    return des;
  },

  // 判断参数是否为空
  isEmpty(a) {
    /* 检验空字符串 */
    if (a === '') return true;
    /* 检验字符串类型的null */
    if (a === 'null') return true;
    /* 检验字符串类型的 undefined	*/
    if (a === 'undefined') return true;
    /* 检验 undefined 和 null */
    if (!a && a !== 0 && a !== '') return true;

    /* 检验空数组	*/
    // if (Array.prototype.isPrototypeOf(a) && a.length === 0) return true;
    if (JSON.stringify(a) === '[]') return true;

    /* 检验空对象  */
    // if (Object.prototype.isPrototypeOf(a) && Object.keys(a).length === 0) return true;
    if (JSON.stringify(a) === '{}') return true;

    return false;
  },

  // 判断是否对象（非数组）
  isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  },

  // 时间戳转日期时间字符串
  // 【重要】timestamp是毫秒时间戳，如果使用秒时间戳，传入参数时，应该乘以1000
  timestampToTime(timestamp = null, options = {}) {
    let date;
    if (timestamp) {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let day = date.getDate();
    day = day < 10 ? '0' + day : day;
    let hour = date.getHours();
    hour = hour < 10 ? '0' + hour : hour;
    let minute = date.getMinutes();
    minute = minute < 10 ? '0' + minute : minute;
    let second = date.getSeconds();
    second = second < 10 ? '0' + second : second;
    const milliseconds = date.getMilliseconds();

    let time = `${year}-${month}-${day}`;

    // 默认显示 年-月-日 小时:分钟:秒 ，可根据选项修改显示内容

    // 不需要显示时间
    if (options.isNotShowTime) {
      return time;
    }
    time = time + ` ${hour}:${minute}`;

    // 不需要显示秒
    if (options.isNotShowSecond) {
      return time;
    }
    time = time + `:${second}`;

    // 需要显示毫秒
    if (options.isShowMilliSecond) {
      time = time + `:${milliseconds}`;
    }

    return time;
  },

  /*
  hexToString(hex) {
    return hex.toString(16);
  },
  */
};
