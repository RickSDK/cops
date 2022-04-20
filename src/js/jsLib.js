function getHostname() {
	return 'https://www.appdigity.com/poker';
//	return 'http://www.appdigity.com/poker';
}
function convertNumberToMoney(num) {
//	var val = '$'+(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
//	return val.
	
	var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
	});

	return formatter.format(num).replace(".00", "");
}
function numberVal(val) {
	if(!val || val.length==0)
		return 0;
	else
		return Number(val);
}
function getMonthYear(month, year) {
	return year+pad(month);
}
function monthNameByNumber(num){
mlist = [ "","January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  return mlist[num];
};
function numberWithSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
function getMonthObj(month, year) {
  	if(month>12) {
  		month-=12;
  		year++;
  	}
  	if(month<1) {
  		month+=12;
  		year--;
  	}
  	return {month: month, year: year};
  }
function pad(n, width=2, z) {
	width = width || 2;
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function convertMoneyToNumber(currencyText) {
	var num = Number(currencyText.replace(/[^0-9\.-]+/g,""));
	return num;
}
function getMonthStr(mon, year) {
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	return months[mon-1] +' '+year;
}
function togglePopup(name, absoluteFlg=false, closeFlg=false) {
	var e = document.getElementById(name);
	if(e) {
		if(!closeFlg && e.style.display!='block') {
			showThisPopup(name, absoluteFlg);
		} else
			closePopup(name);
	} else
		alert('no name:'+name);
}
function showThisPopup(name, absoluteFlg) {
	var e = document.getElementById(name);
	if(e) {
		e.style.display = 'block';
		var w = window.innerWidth;
		var rect = e.getBoundingClientRect();
		var left = (w-rect.width)/2;
		var top = window.pageYOffset;
		
		if(!absoluteFlg)
			top=30;
		if(left<0)
			left=0;
		e.style.left = left.toString()+'px';
		e.style.top = top.toString()+'px';
		scrollToTop();
		if(absoluteFlg) {
			e.style.position = 'absolute';
			window.scrollTo(left, top);
		}
	} else
		alert('not found! '+name);
}
function closePopup(name) {
	var e = document.getElementById(name);
	if(e) {
		e.style.display='none';
	}
}
function changeClass(segName, className) {
	var e = document.getElementById(segName);
	if(e) {
		e.className = className;
	} else
		alert('not found: '+segName);
}
function getMoneyValue(id) {
	var e = document.getElementById(id);
	if(e)
		return convertMoneyToNumber(e.value);
	else {
		return '';
	}
	
}
function getTextFieldValue(id) {
	var e = document.getElementById(id);
	if(e)
		return e.value;
	else {
		return '';
	}
}
function setTextValue(id, text) {
	var e = document.getElementById(id);
	if(e)
		e.value=text;
	else
		alert(id+' not found!');
}
function getMoneyNumberForField(id) {
	var value = getTextFieldValue(id);
	return convertMoneyToNumber(value);
}
function disableButton(id, flag) {
  	var e = document.getElementById(id);
	if(e) {
		e.disabled=flag;
	} 
}
function scrollToTop() {
	window.scrollTo(0, 0);
}
