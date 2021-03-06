var gCards = [
	{id: 0, name: 'Unknown', criminalFlg: false, src: 'cardBack.jpg', desc: ''},
	{id: 1, name: 'Bandit', criminalFlg: true, src: 'robber1.png', desc: 'Your basic run-of-the-mill bank robber. Avoid any robbers getting arrested and you get 3 points.'},
	{id: 2,name: 'Remorseful Criminal', criminalFlg: true, src: 'robber2.png', desc: 'This guy wants to get arrested. 8 points if you succeed. 2 points if no robbers are arrested.'},
	{id: 3, name: 'Hitman', criminalFlg: true, src: 'robber3.png', desc: '1 point if no robbers are arrested. Additional bonus 5 points if either player sitting next to you gets arrested.'},
	{id: 4, name: 'Snitch', criminalFlg: true, src: 'robber4.png', desc: '8 points if you can get the other snitch arrested. Or get 2 points if no robbers are arrested.'},
	{id: 5, name: 'Crime Boss', criminalFlg: true, src: 'robber5.png', desc: '4 bonus points if the Remorseful Criminal or either snitch is arrested.  Alternatively get 1 point if no robbers are arrested.'},
	{id: 6, name: 'Police Officer', criminalFlg: false, src: 'cop1.png', desc: 'You get to peek at one player\'s card. Receive 3 points if a criminal is arrested.'},
	{id: 7, name: 'Guard', criminalFlg: false, src: 'cop2.png', desc: 'You get to peek at one player\'s card. 2 points if a criminal is arrested. 3 bonus points if you and both players sitting next to you all avoid being arrested. '},
	{id: 8, name: 'Detective', criminalFlg: false, src: 'cop3.png', desc: 'You get to peek at one middle card and know if a robber is sitting next to you. 3 Points if a criminal is arrested.'},
	{id: 9, name: 'Forensic', criminalFlg: false, src: 'cop4.png', desc: 'You get to turn over 2 of the middle cards. 3 Points if a criminal is arrested.'},
	{id: 10, name: 'Bumbling Cop', criminalFlg: false, src: 'cop5.png', desc: 'You must switch any two player\'s cards. 2 Points if a criminal is arrested. Bonus 5 points if the Remorseful Criminal is arrested.'},
	{id: 11, name: 'Police Chief', criminalFlg: false, src: 'cop6.png', desc: 'You get to peek at one middle card, and know if you are sitting next to the Gang Boss. 2 Points if a criminal is arrested. Bonus 3 points if you correctly identify (by trying to arrest) the Crime Boss.'}
	];
	
var fakePeople = [
	{id: 1, name: 'Stacy', src: 'avatar1.png', city: 'Everett'},
	{id: 2, name: 'Mike', src: 'avatar2.png', city: 'LA'},
	{id: 3, name: 'Pam', src: 'avatar3.png', city: 'Seattle'},
	{id: 4, name: 'Bob', src: 'avatar4.png', city: 'Boston'},
	{id: 5, name: 'Robb', src: 'avatar5.png', city: 'New York'},
	{id: 6, name: 'Gary', src: 'avatar6.png', city: 'Atlanta'},
	{id: 7, name: 'Dad', src: 'avatar7.png', city: 'New Orleans'},
	{id: 8, name: 'Aiden', src: 'avatar8.png', city: 'Las Vegas'},
	{id: 9, name: 'Jose', src: 'avatar9.png', city: 'Tacoma'},
	{id: 10, name: 'Jane', src: 'avatar10.png', city: 'Snohomish'},
	{id: 11, name: 'Beth', src: 'avatar11.png', city: 'Marysville'},
	{id: 12, name: 'Jashira', src: 'avatar12.png', city: 'San Diego'},
	{id: 13, name: 'Jill', src: 'avatar13.png', city: 'Los Angelos'},
	{id: 14, name: 'Hu', src: 'avatar14.png', city: 'Stockton'},
	{id: 15, name: 'Aliyah', src: 'avatar15.png', city: 'Dallas'},
	{id: 16, name: 'Mauhtuah', src: 'avatar16.png', city: 'Portland'},
	{id: 17, name: 'Betty', src: 'avatar17.png', city: 'Green Bay'},
	{id: 18, name: 'Jan', src: 'avatar18.png', city: 'Orlando'},
	{id: 19, name: 'Nicki', src: 'avatar19.png', city: 'Miami'},
	{id: 20, name: 'Rick', src: 'avatar20.png', city: 'Vancouver'},
	];